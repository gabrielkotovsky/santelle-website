import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

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
    const session_id = params.get('session_id');

    if (!session_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing session_id' }),
      };
    }

    // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
    // Typically this is stored alongside the authenticated user in your database.
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    if (!checkoutSession.customer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No customer found for this session' }),
      };
    }

    // This is the url to which the customer will be redirected when they're done
    // managing their billing with the portal.
    const returnUrl = `${YOUR_DOMAIN}/plans`;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer as string,
      return_url: returnUrl,
    });

    // Redirect to Stripe Billing Portal
    return {
      statusCode: 303,
      headers: {
        Location: portalSession.url,
      },
      body: '',
    };
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

