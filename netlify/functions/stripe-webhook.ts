import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export const handler: Handler = async (event) => {
  // TEMPORARILY DISABLED - Testing Supabase webhook function
  // Remove this early return to re-enable this function
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: 'Netlify webhook temporarily disabled - using Supabase webhook instead',
      received: true 
    }),
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const signature = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing stripe-signature header' }),
    };
  }

  let stripeEvent: Stripe.Event;

  try {
    // Verify webhook signature
    if (endpointSecret) {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body!,
        signature,
        endpointSecret
      );
    } else {
      // If no endpoint secret, just parse the body (not recommended for production)
      stripeEvent = JSON.parse(event.body!);
    }
  } catch (err: any) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Webhook signature verification failed' }),
    };
  }

  let subscription;
  let status;

  // Handle the event
  switch (stripeEvent.type) {
    case 'customer.subscription.trial_will_end':
      subscription = stripeEvent.data.object as Stripe.Subscription;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // TODO: Define and call a method to handle the subscription trial ending.
      // handleSubscriptionTrialEnding(subscription);
      break;

    case 'customer.subscription.deleted':
      subscription = stripeEvent.data.object as Stripe.Subscription;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // TODO: Define and call a method to handle the subscription deleted.
      // handleSubscriptionDeleted(subscription);
      break;

    case 'customer.subscription.created':
      subscription = stripeEvent.data.object as Stripe.Subscription;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // TODO: Define and call a method to handle the subscription created.
      // handleSubscriptionCreated(subscription);
      break;

    case 'customer.subscription.updated':
      subscription = stripeEvent.data.object as Stripe.Subscription;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // TODO: Define and call a method to handle the subscription update.
      // handleSubscriptionUpdated(subscription);
      break;

    case 'entitlements.active_entitlement_summary.updated':
      subscription = stripeEvent.data.object;
      console.log(`Active entitlement summary updated for ${subscription}.`);
      // TODO: Define and call a method to handle active entitlement summary updated
      // handleEntitlementUpdated(subscription);
      break;

    default:
      // Unexpected event type
      console.log(`Unhandled event type ${stripeEvent.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};

