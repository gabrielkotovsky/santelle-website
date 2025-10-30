import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    if (!user_id) {
      return NextResponse.json({ error: 'Unable to extract user_id from checkout/session metadata. Cannot upsert profile.' }, { status: 400 });
    }

    let response: Record<string, any> = {
      user_id: user_id,
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

    // Upsert to profiles table using stripe_customer_id
    let dbResult = null;
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .upsert([
          {
            user_id: response.user_id,
            stripe_customer_id: response.stripe_customer_id,
            email: response.email,
            subscription_id: response.subscription_id,
            subscription_status: response.subscription_status,
            price_id: response.price_id,
            plan_lookup_key: response.plan_lookup_key,
            current_period_end: response.current_period_end,
            cancel_at: response.cancel_at,
            cancel_at_period_end: response.cancel_at_period_end,
            latest_checkout_session_id: response.latest_checkout_session_id,
            updated_at: response.updated_at,
            trial_end_date: response.trial_end_date,
            // Optionally set more fields if you wish
          },
        ], { onConflict: 'user_id' });
      dbResult = error ? { error: error.message } : { data };
    } catch (upsertErr: any) {
      dbResult = { error: upsertErr?.message || String(upsertErr) };
    }

    response.db = dbResult;

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Error retrieving Stripe session details:', err?.message || err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch Stripe session details.' },
      { status: 500 }
    );
  }
}
