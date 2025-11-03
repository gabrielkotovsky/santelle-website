// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@^19.1.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2025-09-30.clover',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the signature from the request headers
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'STRIPE_WEBHOOK_SECRET is not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the raw body for signature verification
    const body = await req.text()

    // Verify webhook signature (using async version for Deno/Edge Functions)
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('⚠️ Webhook signature verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration is missing' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('Processing checkout.session.completed for session:', session.id)

      // Extract metadata
      const user_id = session.metadata?.user_id || session.client_reference_id
      const email = session.metadata?.email || session.customer_email || session.customer_details?.email
      const lookup_key = session.metadata?.lookup_key

      if (!user_id) {
        console.error('Missing user_id in checkout session metadata')
        return new Response(
          JSON.stringify({ error: 'Missing user_id in checkout session' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Retrieve the subscription details from Stripe
      let subscription: Stripe.Subscription | null = null
      let customerId: string | null = null
      let priceId: string | null = null

      if (session.subscription) {
        // Expand subscription if it's just an ID, or use it directly if it's an object
        if (typeof session.subscription === 'string') {
          subscription = await stripe.subscriptions.retrieve(session.subscription, {
            expand: ['items.data.price']
          })
        } else {
          subscription = session.subscription
        }

        customerId = typeof subscription.customer === 'string' 
          ? subscription.customer 
          : subscription.customer?.id || null

        // Get price ID from subscription
        // Note: items might need to be expanded if not already
        if (subscription.items?.data?.[0]?.price?.id) {
          priceId = subscription.items.data[0].price.id
        } else if (subscription.items?.data?.[0]?.price && typeof subscription.items.data[0].price === 'string') {
          priceId = subscription.items.data[0].price
        }
      } else if (session.customer) {
        customerId = typeof session.customer === 'string' 
          ? session.customer 
          : session.customer?.id || null
      }

      // Prepare profile update data
      const profileData: any = {
        email: email || undefined,
        stripe_customer_id: customerId || undefined,
        subscription_status: subscription?.status || undefined,
        price_id: priceId || undefined,
        plan_lookup_key: lookup_key || undefined,
        current_period_end: subscription?.current_period_end 
          ? new Date(subscription.current_period_end * 1000).toISOString() 
          : undefined,
        cancel_at: subscription?.cancel_at 
          ? new Date(subscription.cancel_at * 1000).toISOString() 
          : undefined,
        cancel_at_period_end: subscription?.cancel_at_period_end || undefined,
        subscription_id: subscription?.id || undefined,
        latest_checkout_session_id: session.id || undefined,
        updated_at: new Date().toISOString(),
        trial_end_date: subscription?.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : undefined,
        shipping_details: session.collected_information?.shipping_details || undefined,
      }

      // Remove undefined values
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === undefined) {
          delete profileData[key]
        }
      })

      // Update or insert profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user_id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('Error fetching profile:', fetchError)
        return new Response(
          JSON.stringify({ error: 'Database error: ' + fetchError.message }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user_id)

        if (updateError) {
          console.error('Error updating profile:', updateError)
          return new Response(
            JSON.stringify({ error: 'Database error updating profile: ' + updateError.message }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        console.log('Profile updated successfully for user:', user_id)
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            user_id,
            ...profileData,
            created_at: new Date().toISOString(),
          }])

        if (insertError) {
          console.error('Error inserting profile:', insertError)
          return new Response(
            JSON.stringify({ error: 'Database error inserting profile: ' + insertError.message }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        console.log('Profile created successfully for user:', user_id)
      }

      return new Response(
        JSON.stringify({ 
          received: true, 
          message: 'Checkout session processed successfully',
          user_id,
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Handle other event types (for future expansion)
    console.log(`Unhandled event type: ${event.type}`)
    
    return new Response(
      JSON.stringify({ received: true, event_type: event.type }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhook' \
    --header 'Authorization: Bearer [YOUR_ANON_KEY]' \
    --header 'Content-Type: application/json' \
    --header 'stripe-signature: [SIGNATURE]' \
    --data '{"type":"checkout.session.completed","data":{"object":{...}}}'

*/
