import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function GET(req: NextRequest) {
  try {
    // Get the session from the request headers
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client to verify the token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to fetch profile and get stripe_customer_id
    const supabaseAdmin = getSupabaseAdmin();
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json({
        subscription: null,
        message: 'No Stripe customer found',
      });
    }

    // Fetch subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 1,
      expand: ['data.default_payment_method', 'data.items.data.price.product'],
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        subscription: null,
        message: 'No active subscription found',
      });
    }

    const subscription = subscriptions.data[0];
    const price = subscription.items.data[0]?.price;
    const product = price?.product as Stripe.Product | undefined;

    // Extract relevant subscription data
    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      plan_lookup_key: price?.lookup_key || null,
      plan_name: product?.name || null,
      billing_interval: price?.recurring?.interval || null,
      billing_interval_count: price?.recurring?.interval_count || null,
    };

    return NextResponse.json({
      subscription: subscriptionData,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching Stripe subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}

