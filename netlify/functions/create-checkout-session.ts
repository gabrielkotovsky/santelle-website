import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse form-encoded data from the request body
    const params = new URLSearchParams(event.body || '');
    const lookup_key = params.get('lookup_key');
    const user_id = params.get('user_id'); // Optional - only if user is authenticated
    const email = params.get('email'); // Optional - Stripe will collect email during checkout

    if (!lookup_key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing lookup_key' }),
      };
    }

    // Init Supabase Admin - only if user_id is provided
    if (user_id && email) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Check/create profile entry
      const { data: profile, error: getProfileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (getProfileError && getProfileError.code !== 'PGRST116') {
        // Not the 'no rows found' code
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'DB error while looking up profile: ' + getProfileError.message }),
        };
      }
      if (!profile) {
        // Insert
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert([{ user_id, email }]);
        if (insertError) {
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'DB error while inserting profile: ' + insertError.message }),
          };
        }
      }
    }

    // Get prices from Stripe using lookup key
    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ['data.product'],
    });

    if (prices.data.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Price not found for lookup key: ' + lookup_key }),
      };
    }

    const price = prices.data[0];
    const isRecurringPrice = price.type === 'recurring' || !!price.recurring;

    const baseSessionParams: Stripe.Checkout.SessionCreateParams = {
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['CH'],
      },
      line_items: [
        {
          price: price.id,
          quantity: 1,
          adjustable_quantity: isRecurringPrice
            ? undefined
            : {
                enabled: true,
                minimum: 1,
                maximum: 10,
              },
        },
      ],
      success_url: `${YOUR_DOMAIN}/plans?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/plans?canceled=true`,
      customer_email: email || undefined, // Optional - Stripe will collect email during checkout if not provided
      metadata: {
        ...(user_id ? { user_id } : {}),
        ...(email ? { email } : {}),
        lookup_key,
        purchase_type: isRecurringPrice ? 'subscription' : 'one_time',
      },
    };

    let session: Stripe.Checkout.Session;
    if (isRecurringPrice) {
      session = await stripe.checkout.sessions.create({
        ...baseSessionParams,
        mode: 'subscription',
        subscription_data: {
          metadata: {
            ...(user_id ? { user_id } : {}),
            ...(email ? { email } : {}),
            lookup_key,
          },
        },
      });
    } else {
      session = await stripe.checkout.sessions.create({
        ...baseSessionParams,
        mode: 'payment',
      });
    }

    // Redirect to Stripe Checkout
    return {
      statusCode: 303,
      headers: {
        Location: session.url!,
      },
      body: '',
    };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

