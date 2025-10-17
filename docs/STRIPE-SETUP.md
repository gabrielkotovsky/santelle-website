# Stripe Integration Setup Guide

## ✅ Implementation Complete

I've implemented the Stripe checkout system as Netlify Functions. Here's what was created:

### Files Created:
1. **`netlify/functions/create-checkout-session.ts`** - Handles checkout session creation
2. **`netlify/functions/create-portal-session.ts`** - Handles billing portal access
3. **`netlify/functions/stripe-webhook.ts`** - Handles Stripe webhook events
4. **`netlify.toml`** - Netlify configuration with function redirects
5. **`src/app/checkout/page.tsx`** - Frontend checkout page (already done)

---

## 🚀 Quick Start

### Step 1: Add Environment Variables

Create a `.env.local` file in your project root (or add to existing):

```bash
# Stripe Keys (ALREADY IN YOUR CODE - Test mode)
STRIPE_SECRET_KEY=sk_test_51SJ774JlYw3I7F33QuVxq6i3hKuRtvkCIwkU2Iu3lhuJvRkC5VQ0yirgy5LtUUBPagCyvXf9oXkAtdwWSRP7YFzP00ztDc3rgh
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Get webhook secret from Step 3
STRIPE_WEBHOOK_SECRET=whsec_12345

# Local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Important:** Your test secret key is already in the code you provided. You need to add the publishable key and webhook secret.

### Step 2: Configure Stripe Product

1. Go to https://dashboard.stripe.com/test/products
2. Click **"+ Add product"**
3. Fill in:
   - **Name:** `Proactive Plan - Monthly Kit`
   - **Description:** Monthly subscription to Santelle testing kit
   - **Pricing model:** Recurring
   - **Price:** `€12.99` EUR
   - **Billing period:** Monthly
4. Click **"Save product"**
5. After saving, on the price row, click **"⋯" → "Add lookup key"**
6. Enter lookup key: `Proactive_Plan_-_Monthly_Kit-2465a9f`
7. Click **"Add"**

**Why lookup keys?** They let you reference prices by name instead of remembering IDs.

### Step 3: Get Webhook Secret (For Local Testing)

Open a new terminal and run:

```bash
stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook
```

This will output:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Copy that `whsec_` value and add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

**What this does:** Forwards Stripe events from their servers to your local machine for testing.

### Step 4: Enable Customer Billing Portal

1. Go to https://dashboard.stripe.com/test/settings/billing/portal
2. Click **"Activate test link"** or configure settings
3. Enable these features:
   - ✅ **Update payment method**
   - ✅ **View invoices**
   - ✅ **Cancel subscriptions** (choose when: "At period end" recommended)
4. **Optional:** Customize branding:
   - Upload Santelle logo
   - Set brand color: `#721422`
5. Click **"Save changes"**

---

## 🧪 Local Testing

### Start Development Server

In one terminal:
```bash
netlify dev
```

This starts:
- Next.js app on `http://localhost:8888`
- Netlify functions at `/.netlify/functions/`

### Start Stripe Webhook Listener

In another terminal:
```bash
stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook
```

### Test the Flow

1. Open http://localhost:8888/checkout
2. Click **"Checkout"** button
3. You'll be redirected to Stripe Checkout (test mode)
4. Use test card: `4242 4242 4242 4242`
5. Enter any future expiry date (e.g., `12/34`)
6. Enter any 3-digit CVC (e.g., `123`)
7. Fill in billing address
8. Click **"Subscribe"**
9. You should be redirected back to success page
10. Click **"Manage your billing information"**
11. Verify billing portal loads

### Test Cards

- **Success:** `4242 4242 4242 4242`
- **Declined:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0025 0000 3155`

---

## 📦 Deploy to Netlify

### Step 1: Push to Git

```bash
git add .
git commit -m "Add Stripe payment integration"
git push origin main
```

### Step 2: Add Environment Variables to Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **"Add a variable"** for each:

```
STRIPE_SECRET_KEY = sk_test_51SJ774JlYw3I7F33QuVxq6i3hKuRtvkCIwkU2Iu3lhuJvRkC5VQ0yirgy5LtUUBPagCyvXf9oXkAtdwWSRP7YFzP00ztDc3rgh
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_YOUR_KEY_HERE
NEXT_PUBLIC_APP_URL = https://your-site.netlify.app
STRIPE_WEBHOOK_SECRET = (get from production webhook - see Step 3)
```

### Step 3: Create Production Webhook

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"+ Add endpoint"**
3. Enter endpoint URL: `https://your-site.netlify.app/webhook`
4. Click **"Select events"**
5. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `entitlements.active_entitlement_summary.updated`
6. Click **"Add endpoint"**
7. Copy the **"Signing secret"** (starts with `whsec_`)
8. Add it as `STRIPE_WEBHOOK_SECRET` in Netlify environment variables

### Step 4: Test on Live Site

1. Visit your deployed site: `https://your-site.netlify.app/checkout`
2. Complete a test purchase
3. Verify webhook events in Netlify function logs:
   - Go to Netlify dashboard → **Functions** tab
   - Click **"stripe-webhook"**
   - Check logs for event processing

---

## 🔍 Verify Everything Works

### Checklist:

- [ ] Checkout button redirects to Stripe
- [ ] Test card payment succeeds
- [ ] Success page shows with session ID
- [ ] "Manage billing" button works
- [ ] Customer portal loads and shows subscription
- [ ] Cancel checkout returns to site with message
- [ ] Webhook events appear in Netlify logs
- [ ] Webhook events appear in Stripe dashboard

### Where to Check Logs:

**Netlify Function Logs:**
1. Netlify Dashboard → Functions → Select function
2. View real-time logs

**Stripe Webhook Logs:**
1. https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. View event history

**Stripe Checkout Sessions:**
1. https://dashboard.stripe.com/test/payments
2. View all checkout sessions and their status

---

## 🎯 What Each Function Does

### `create-checkout-session.ts`
- **Input:** `lookup_key` from form
- **Process:** 
  1. Looks up price in Stripe
  2. Creates checkout session
  3. Redirects to Stripe Checkout
- **Output:** Redirect to Stripe hosted checkout page

### `create-portal-session.ts`
- **Input:** `session_id` from form
- **Process:**
  1. Retrieves customer from checkout session
  2. Creates billing portal session
  3. Redirects to Stripe billing portal
- **Output:** Redirect to Stripe hosted billing portal

### `stripe-webhook.ts`
- **Input:** Webhook events from Stripe
- **Process:**
  1. Verifies webhook signature
  2. Processes different event types
  3. Logs subscription changes
- **Output:** Acknowledges receipt (200 status)

---

## 🔐 Security Features

✅ **Webhook signature verification** - Prevents fake events
✅ **Environment variables** - API keys not in code
✅ **HTTPS required** - Encrypted communication
✅ **POST-only endpoints** - Prevents CSRF attacks

---

## 🐛 Troubleshooting

### "Price not found" error

**Problem:** Lookup key doesn't match
**Solution:** 
1. Check exact lookup key in Stripe Dashboard
2. Ensure it matches exactly: `Proactive_Plan_-_Monthly_Kit-2465a9f`

### Webhook signature verification fails

**Problem:** Wrong webhook secret
**Solution:**
1. Get correct secret from Stripe Dashboard → Webhooks
2. Update `STRIPE_WEBHOOK_SECRET` in environment variables
3. Redeploy if needed

### Redirect doesn't work after checkout

**Problem:** Wrong `NEXT_PUBLIC_APP_URL`
**Solution:**
1. Check environment variable matches your actual URL
2. No trailing slash
3. Include `https://` for production

### Function not found error

**Problem:** Netlify can't find the function
**Solution:**
1. Verify `netlify.toml` exists
2. Check `netlify/functions/` directory has .ts files
3. Redeploy: `git push origin main`

---

## 📊 Next Steps

Once basic checkout works, you can add:

1. **Multiple Plans** - Create more products in Stripe
2. **Database Integration** - Save subscriptions to Supabase
3. **Email Notifications** - Send confirmation via Resend
4. **Plan Selection** - Pass selected plan from quiz to checkout
5. **Usage Tracking** - Monitor successful checkouts
6. **Production Mode** - Switch to live Stripe keys

---

## 🔗 Useful Links

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe Testing:** https://stripe.com/docs/testing
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Netlify Functions:** https://docs.netlify.com/functions/overview/

---

## ✨ You're All Set!

Your Stripe integration is complete and ready to test. Follow the Quick Start steps above to get it running locally, then deploy to Netlify when ready.

**Questions?** Check the Troubleshooting section or Stripe documentation.

