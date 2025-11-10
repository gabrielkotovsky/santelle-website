// @ts-nocheck
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

    console.log('Webhook received - Method:', req.method)
    console.log('Has signature:', !!signature)
    console.log('Has webhook secret:', !!webhookSecret)

    if (!signature) {
      console.error('❌ Missing stripe-signature header')
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET is not configured')
      return new Response(
        JSON.stringify({ error: 'STRIPE_WEBHOOK_SECRET is not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the raw body for signature verification
    let body: string
    try {
      body = await req.text()
      console.log('Body length:', body.length)
    } catch (bodyError: any) {
      console.error('❌ Error reading request body:', bodyError.message)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to read request body',
          details: bodyError.message 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verify webhook signature (using async version for Deno/Edge Functions)
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
      console.log('✅ Webhook signature verified. Event type:', event.type, 'ID:', event.id)
    } catch (err: any) {
      console.error('⚠️ Webhook signature verification failed:', err.message)
      console.error('Error type:', err.constructor.name)
      console.error('Signature preview:', signature?.substring(0, 20) + '...')
      console.error('Signature length:', signature?.length)
      console.error('Body length:', body.length)
      console.error('Webhook secret configured:', !!webhookSecret)
      console.error('Webhook secret length:', webhookSecret?.length || 0)
      
      return new Response(
        JSON.stringify({ 
          error: 'Webhook signature verification failed',
          details: err.message,
          error_type: err.constructor.name
        }),
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

    console.log('Processing webhook event:', event.type, 'ID:', event.id)

    // Helper function to get customer details and payment method info
    const getCustomerAndPaymentDetails = async (customerId: string | null) => {
      let name: string | undefined = undefined
      let country: string | undefined = undefined
      let default_payment_method_last4: string | undefined = undefined

      if (customerId) {
        try {
          const customer = await stripe.customers.retrieve(customerId)
          if (customer && !customer.deleted && typeof customer === 'object') {
            name = customer.name || undefined
            country = customer.address?.country || customer.shipping?.address?.country || undefined
          }
        } catch (err) {
          console.log('Could not retrieve customer details:', err)
        }
      }

      return { name, country, default_payment_method_last4 }
    }

    // Helper function to get payment method last4 from subscription
    const getPaymentMethodLast4 = async (subscription: Stripe.Subscription): Promise<string | undefined> => {
      if (subscription.default_payment_method) {
        try {
          const paymentMethodId = typeof subscription.default_payment_method === 'string'
            ? subscription.default_payment_method
            : subscription.default_payment_method.id

          const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
          if (paymentMethod && paymentMethod.card) {
            return paymentMethod.card.last4 || undefined
          }
        } catch (err) {
          console.log('Could not retrieve payment method:', err)
        }
      }
      return undefined
    }

    const getLast4FromPaymentIntent = async (paymentIntentId: string): Promise<string | undefined> => {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
          expand: ['payment_method', 'latest_charge.payment_method_details'],
        })

        if (pi.payment_method && typeof pi.payment_method !== 'string' && pi.payment_method.card?.last4) {
          return pi.payment_method.card.last4
        }

        const latestCharge = pi.latest_charge && typeof pi.latest_charge !== 'string' ? pi.latest_charge : undefined
        if (latestCharge?.payment_method_details?.card?.last4) {
          return latestCharge.payment_method_details.card.last4
        }
      } catch (err) {
        console.log('Could not retrieve payment intent for last4:', err)
      }
      return undefined
    }

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

      if (!priceId && (!subscription || session.mode === 'payment')) {
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 })
          const firstItem = lineItems.data[0]
          if (firstItem?.price?.id) {
            priceId = firstItem.price.id
          }
        } catch (err) {
          console.log('Could not retrieve line items for price info:', err)
        }
      }

      // Get customer details and payment method info
      const customerDetails = await getCustomerAndPaymentDetails(customerId)
      let paymentMethodLast4: string | undefined = undefined
      
      // Get name and country from checkout session customer_details if available
      const name = session.customer_details?.name || customerDetails.name
      const country = session.customer_details?.address?.country || customerDetails.country

      // Get payment method last4 from subscription if available
      if (subscription) {
        paymentMethodLast4 = await getPaymentMethodLast4(subscription)
      } else if (session.payment_intent && typeof session.payment_intent === 'string') {
        paymentMethodLast4 = await getLast4FromPaymentIntent(session.payment_intent)
      }

      const nowIso = new Date().toISOString()
      let profileData: any

      if (session.mode === 'payment') {
        const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        profileData = {
          email: email || undefined,
          stripe_customer_id: customerId || undefined,
          subscription_status: 'trialing',
          price_id: priceId || undefined,
          plan_lookup_key: lookup_key || undefined,
          current_period_end: trialEndDate.toISOString(),
          cancel_at: null,
          cancel_at_period_end: false,
          subscription_id: null,
          latest_checkout_session_id: session.id || undefined,
          updated_at: nowIso,
          trial_end_date: trialEndDate.toISOString(),
          shipping_details: session.collected_information?.shipping_details ? JSON.stringify(session.collected_information.shipping_details) : undefined,
          name: name || undefined,
          country: country || undefined,
          default_payment_method_last4: paymentMethodLast4 || undefined,
          raw: event.data.object ? JSON.parse(JSON.stringify(event.data.object)) : undefined,
        }
      } else {
        // Prepare profile update data for subscription mode
        profileData = {
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
          updated_at: nowIso,
          trial_end_date: subscription?.trial_end 
            ? new Date(subscription.trial_end * 1000).toISOString() 
            : undefined,
          shipping_details: session.collected_information?.shipping_details ? JSON.stringify(session.collected_information.shipping_details) : undefined,
          name: name || undefined,
          country: country || undefined,
          default_payment_method_last4: paymentMethodLast4 || undefined,
          raw: event.data.object ? JSON.parse(JSON.stringify(event.data.object)) : undefined,
        }
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

    // Handle the customer.subscription.created event
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription

      console.log('Processing customer.subscription.created for subscription:', subscription.id)

      // Extract metadata
      let user_id = subscription.metadata?.user_id
      let email = subscription.metadata?.email
      const lookup_key = subscription.metadata?.lookup_key

      // Extract customer ID
      const customerId = typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer?.id || null

      // Get customer details (including email, name, country) and payment method info
      let customerName: string | undefined = undefined
      let customerCountry: string | undefined = undefined
      
      if (customerId) {
        try {
          const customer = await stripe.customers.retrieve(customerId)
          if (customer && !customer.deleted && typeof customer === 'object') {
            if (!email && 'email' in customer) {
              email = customer.email || undefined
            }
            customerName = customer.name || undefined
            customerCountry = customer.address?.country || customer.shipping?.address?.country || undefined
          }
        } catch (err) {
          console.log('Could not retrieve customer:', err)
        }
      }

      // Get payment method last4 from subscription
      const paymentMethodLast4 = await getPaymentMethodLast4(subscription)

      // If user_id is not in metadata, try to find it by customer_id
      if (!user_id && customerId) {
        console.log('user_id not found in metadata, attempting to find by customer_id:', customerId)
        const { data: profileByCustomer, error: customerLookupError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!customerLookupError && profileByCustomer) {
          user_id = profileByCustomer.user_id
          console.log('Found user_id by customer_id:', user_id)
        }
      }

      // If user_id still not found, try to find it by email
      if (!user_id && email) {
        console.log('user_id not found by customer_id, attempting to find by email:', email)
        const { data: profileByEmail, error: emailLookupError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', email.toLowerCase().trim())
          .single()

        if (!emailLookupError && profileByEmail) {
          user_id = profileByEmail.user_id
          console.log('Found user_id by email:', user_id)
        }
      }

      if (!user_id) {
        console.error('Missing user_id - not found in metadata, by customer_id, or by email')
        // Still process the event but log the issue
        console.log('Subscription data:', {
          subscription_id: subscription.id,
          customer_id: customerId,
          email: email,
          metadata: subscription.metadata,
        })
        // Return 200 but log the issue - don't fail the webhook
        return new Response(
          JSON.stringify({ 
            received: true,
            warning: 'Could not find user_id - subscription data logged',
            subscription_id: subscription.id,
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Extract price ID from subscription items
      let priceId: string | null = null
      if (subscription.items?.data?.[0]?.price?.id) {
        priceId = subscription.items.data[0].price.id
      } else if (subscription.items?.data?.[0]?.price && typeof subscription.items.data[0].price === 'string') {
        priceId = subscription.items.data[0].price
      }

      // Get current_period_end - it might be at subscription level or in items
      let current_period_end: number | null = null
      if (subscription.current_period_end) {
        current_period_end = subscription.current_period_end
      } else if (subscription.items?.data?.[0]?.current_period_end) {
        current_period_end = subscription.items.data[0].current_period_end
      }

      // Prepare profile update data
      const profileData: any = {
        email: email || undefined,
        stripe_customer_id: customerId || undefined,
        subscription_status: subscription.status || undefined,
        price_id: priceId || undefined,
        plan_lookup_key: lookup_key || undefined,
        current_period_end: current_period_end 
          ? new Date(current_period_end * 1000).toISOString() 
          : undefined,
        cancel_at: subscription.cancel_at 
          ? new Date(subscription.cancel_at * 1000).toISOString() 
          : undefined,
        cancel_at_period_end: subscription.cancel_at_period_end || undefined,
        subscription_id: subscription.id || undefined,
        updated_at: new Date().toISOString(),
        trial_end_date: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : undefined,
        name: customerName || undefined,
        country: customerCountry || undefined,
        default_payment_method_last4: paymentMethodLast4 || undefined,
        raw: event.data.object ? JSON.parse(JSON.stringify(event.data.object)) : undefined,
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
          message: 'Subscription created event processed successfully',
          user_id,
          subscription_id: subscription.id,
          current_period_end: current_period_end 
            ? new Date(current_period_end * 1000).toISOString() 
            : null,
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Handle the customer.subscription.updated event
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription

      console.log('Processing customer.subscription.updated for subscription:', subscription.id)

      // Extract metadata
      let user_id = subscription.metadata?.user_id
      let email = subscription.metadata?.email
      const lookup_key = subscription.metadata?.lookup_key || subscription.items?.data?.[0]?.price?.lookup_key

      // Extract customer ID
      const customerId = typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer?.id || null

      // Get customer details (including email, name, country) and payment method info
      let customerName: string | undefined = undefined
      let customerCountry: string | undefined = undefined
      
      if (customerId) {
        try {
          const customer = await stripe.customers.retrieve(customerId)
          if (customer && !customer.deleted && typeof customer === 'object') {
            if (!email && 'email' in customer) {
            email = customer.email || undefined
            }
            customerName = customer.name || undefined
            customerCountry = customer.address?.country || customer.shipping?.address?.country || undefined
          }
        } catch (err) {
          console.log('Could not retrieve customer:', err)
        }
      }

      // Get payment method last4 from subscription
      const paymentMethodLast4 = await getPaymentMethodLast4(subscription)

      // If user_id is not in metadata, try to find it by customer_id
      if (!user_id && customerId) {
        console.log('user_id not found in metadata, attempting to find by customer_id:', customerId)
        const { data: profileByCustomer, error: customerLookupError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!customerLookupError && profileByCustomer) {
          user_id = profileByCustomer.user_id
          console.log('Found user_id by customer_id:', user_id)
        }
      }

      // If user_id still not found, try to find it by email
      if (!user_id && email) {
        console.log('user_id not found by customer_id, attempting to find by email:', email)
        const { data: profileByEmail, error: emailLookupError } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('email', email.toLowerCase().trim())
          .single()

        if (!emailLookupError && profileByEmail) {
          user_id = profileByEmail.user_id
          console.log('Found user_id by email:', user_id)
        }
      }

      if (!user_id) {
        console.error('Missing user_id - not found in metadata, by customer_id, or by email')
        // Still process the event but log the issue
        console.log('Subscription data:', {
          subscription_id: subscription.id,
          customer_id: customerId,
          email: email,
          metadata: subscription.metadata,
        })
        // Return 200 but log the issue - don't fail the webhook
        return new Response(
          JSON.stringify({ 
            received: true,
            warning: 'Could not find user_id - subscription data logged',
            subscription_id: subscription.id,
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Extract price ID from subscription items
      let priceId: string | null = null
      if (subscription.items?.data?.[0]?.price?.id) {
        priceId = subscription.items.data[0].price.id
      } else if (subscription.items?.data?.[0]?.price && typeof subscription.items.data[0].price === 'string') {
        priceId = subscription.items.data[0].price
      }

      // Get current_period_end - it might be at subscription level or in items
      let current_period_end: number | null = null
      if (subscription.current_period_end) {
        current_period_end = subscription.current_period_end
      } else if (subscription.items?.data?.[0]?.current_period_end) {
        current_period_end = subscription.items.data[0].current_period_end
      }

      // Prepare profile update data
      const profileData: any = {
        email: email || undefined,
        stripe_customer_id: customerId || undefined,
        subscription_status: subscription.status || undefined,
        price_id: priceId || undefined,
        plan_lookup_key: lookup_key || undefined,
        current_period_end: current_period_end 
          ? new Date(current_period_end * 1000).toISOString() 
          : undefined,
        cancel_at: subscription.cancel_at 
          ? new Date(subscription.cancel_at * 1000).toISOString() 
          : undefined,
        cancel_at_period_end: subscription.cancel_at_period_end || undefined,
        subscription_id: subscription.id || undefined,
        updated_at: new Date().toISOString(),
        trial_end_date: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : undefined,
        name: customerName || undefined,
        country: customerCountry || undefined,
        default_payment_method_last4: paymentMethodLast4 || undefined,
        raw: event.data.object ? JSON.parse(JSON.stringify(event.data.object)) : undefined,
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
          message: 'Subscription updated event processed successfully',
          user_id,
          subscription_id: subscription.id,
          current_period_end: current_period_end 
            ? new Date(current_period_end * 1000).toISOString() 
            : null,
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
