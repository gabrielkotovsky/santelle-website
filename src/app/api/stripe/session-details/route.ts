import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get('session_id');
  if (!session_id) {
    return NextResponse.json({ error: 'Missing session_id param' }, { status: 400 });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    });

    // Always extract customer id safely, regardless of expansion
    let customer_id = '';
    if (checkoutSession.customer && typeof checkoutSession.customer === 'object' && 'id' in checkoutSession.customer) {
      customer_id = (checkoutSession.customer as { id: string }).id;
    } else if (typeof checkoutSession.customer === 'string') {
      customer_id = checkoutSession.customer;
    }

    const email = checkoutSession.customer_details?.email || '';
    const subscriptionObj = checkoutSession.subscription as Stripe.Subscription | null;

    // Extract user_id from metadata (prefer subscription, fallback to checkoutSession)
    let user_id = '';
    if (subscriptionObj && subscriptionObj.metadata?.user_id) {
      user_id = subscriptionObj.metadata.user_id;
    } else if (checkoutSession.metadata?.user_id) {
      user_id = checkoutSession.metadata.user_id;
    }

    // DISABLED: Database upsert - Supabase webhook handles profile updates
    // This route now only retrieves and returns session details for display purposes
    let response: Record<string, any> = {
      user_id: user_id || null,
      stripe_customer_id: customer_id,
      email: email,
      latest_checkout_session_id: session_id,
      updated_at: new Date().toISOString(),
    };

    if (subscriptionObj) {
      const firstItem = subscriptionObj.items.data[0];
      response.subscription_id = subscriptionObj.id;
      response.subscription_status = subscriptionObj.status;
      response.price_id = firstItem?.price?.id || '';
      response.plan_lookup_key = firstItem?.price?.lookup_key || checkoutSession.metadata?.lookup_key || '';
      response.current_period_end = (subscriptionObj as any).current_period_end
        ? new Date((subscriptionObj as any).current_period_end * 1000).toISOString()
        : null;
      response.cancel_at = subscriptionObj.cancel_at
        ? new Date(subscriptionObj.cancel_at * 1000).toISOString()
        : null;
      response.cancel_at_period_end = subscriptionObj.cancel_at_period_end;
      response.trial_end_date = subscriptionObj.trial_end
        ? new Date(subscriptionObj.trial_end * 1000).toISOString()
        : null;
    } else if (checkoutSession.metadata) {
      response.plan_lookup_key = checkoutSession.metadata.lookup_key || '';
    }

    // NOTE: Profile updates are now handled by Supabase webhook function
    // Removed database upsert to avoid conflicts

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Error retrieving Stripe session details:', err?.message || err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Stripe session details.' },
      { status: 500 }
    );
  }
}
