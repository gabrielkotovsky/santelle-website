# Santelle Website - E-commerce Launch Checklist

## 🚨 CRITICAL - Must Complete Before Launch

### 1. Stripe Webhook Implementation ⚠️
**Status:** Currently only logging events, not updating database

**Required Actions:**
- [ ] Implement `handleSubscriptionCreated()` to update profiles table when subscription is created
- [ ] Implement `handleSubscriptionUpdated()` to sync subscription status changes
- [ ] Implement `handleSubscriptionDeleted()` to handle cancellations
- [ ] Implement `handleSubscriptionTrialEnding()` to send reminder emails 48h before trial ends
- [ ] Add `checkout.session.completed` event handler
- [ ] Add `invoice.payment_failed` event handler for failed payments
- [ ] Add `invoice.payment_succeeded` event handler
- [ ] Add proper error handling and retry logic for webhook failures
- [ ] Test all webhook events in staging environment
- [ ] Set up webhook monitoring and alerting

**Files to Update:**
- `netlify/functions/stripe-webhook.ts`

---

### 2. Payment & Order Confirmation Emails
**Status:** Missing

**Required Actions:**
- [ ] Create order confirmation email template (sent after successful payment)
- [ ] Create shipping confirmation email template (when kit ships)
- [ ] Create trial ending reminder email (48 hours before first charge)
- [ ] Create payment successful email (for each billing cycle)
- [ ] Create payment failed email template
- [ ] Create subscription cancelled confirmation email
- [ ] Update webhook handlers to trigger these emails
- [ ] Test all email templates on mobile and desktop clients

**Implementation:**
- Use Resend API (already integrated)
- Add email templates to webhook handlers

---

### 3. Order Fulfillment & Shipping Workflow
**Status:** Missing

**Required Actions:**
- [ ] Create fulfillment tracking system in database
  - Orders table (order_id, user_id, stripe_subscription_id, shipping_address, status, tracking_number)
  - Order status: pending, processing, shipped, delivered, cancelled
- [ ] Build admin dashboard or integrate with fulfillment system
- [ ] Create webhook handler to create order when subscription starts billing
- [ ] Add shipping address collection (already enabled in Stripe Checkout)
- [ ] Integrate with shipping provider API (e.g., Swiss Post, DHL)
- [ ] Create order tracking page for customers
- [ ] Implement inventory management system
- [ ] Set up automatic order creation when trial ends and billing begins
- [ ] Create fulfillment notification system for your team

**New Files Needed:**
- `src/app/api/orders/route.ts`
- `src/app/orders/[orderId]/page.tsx`
- `src/app/admin/orders/page.tsx` (protected admin route)

---

### 4. Error Handling & Failed Payments
**Status:** Basic handling, needs comprehensive implementation

**Required Actions:**
- [ ] Implement payment failure recovery flow
  - Send email to customer with payment update link
  - Automatically retry failed payments (Stripe Smart Retries)
  - Suspend subscription after X failed attempts
- [ ] Create "Update Payment Method" page
- [ ] Add Stripe Customer Portal link in all relevant emails
- [ ] Implement dunning management (automated reminder emails)
- [ ] Handle expired/invalid credit cards
- [ ] Create grace period logic (e.g., 7 days after failed payment)
- [ ] Add payment failure notifications to admin dashboard

---

### 5. Legal & Compliance Documents
**Status:** Privacy Policy exists, Terms of Service missing

**Required Actions:**
- [ ] Create comprehensive **Terms of Service** document covering:
  - Subscription terms and billing
  - Cancellation and refund policy
  - Product descriptions and disclaimers
  - Limitation of liability
  - User rights and responsibilities
  - Dispute resolution
  - Governing law (Swiss/EU)
- [ ] Create **Refund & Return Policy** page
  - Clear refund terms (e.g., "unused kits within 30 days")
  - Return shipping instructions
  - Processing time for refunds
- [ ] Create **Shipping Policy** page
  - Delivery times
  - Shipping costs (if any)
  - International shipping (currently only Switzerland)
  - Lost/damaged shipment policy
- [ ] Update Privacy Policy to include:
  - Stripe payment data processing
  - Health data handling (when kits are used)
  - Customer support data retention
- [ ] Add cookie consent banner (GDPR compliance)
- [ ] Create **Medical Disclaimer** (since it's a health product)
- [ ] Add links to all legal documents in footer and checkout flow

**New Files Needed:**
- `src/app/terms-of-service/page.tsx`
- `src/app/refund-policy/page.tsx`
- `src/app/shipping-policy/page.tsx`

---

### 6. Contact Form & Customer Support
**Status:** Contact form is currently disabled

**Required Actions:**
- [ ] Re-enable contact form with proper validation
- [ ] Set up customer support email system
- [ ] Create support ticket system or integrate with platform (e.g., Zendesk, Intercom)
- [ ] Add FAQ page
- [ ] Create "Help Center" with common questions about:
  - How to use the kit
  - Subscription management
  - Billing questions
  - Shipping tracking
  - Account issues
- [ ] Set up support hours and SLA (Service Level Agreement)
- [ ] Create canned responses for common questions
- [ ] Add live chat widget (optional, recommended: Intercom, Crisp)

**Files to Update:**
- `src/app/contact-us/page.tsx` (re-enable form)
- `src/app/api/contact/route.ts` (verify working)

**New Files Needed:**
- `src/app/faq/page.tsx`
- `src/app/help/page.tsx`

---

## 🔥 HIGH PRIORITY - Complete Within First Week

### 7. Stripe Configuration & Testing
**Required Actions:**
- [ ] Verify all 6 Stripe products/prices are created with correct lookup keys:
  - `proactive-monthly` (€12.99/month)
  - `proactive-annual` (€129.99/year)
  - `balanced-bimonthly` (€16.99/2 months)
  - `balanced-annual` (€79.99/year)
  - `essential-quarterly` (€19.99/3 months)
  - `essential-annual` (€59.99/year)
- [ ] Configure Stripe Billing Portal settings:
  - Allow customers to update payment methods
  - Allow customers to cancel subscriptions
  - Allow customers to update billing information
  - Customize portal appearance to match brand
- [ ] Set up Stripe Tax (if applicable for Switzerland/EU)
- [ ] Enable Stripe Radar for fraud prevention
- [ ] Configure automatic invoice generation
- [ ] Set up Stripe email notifications
- [ ] Test complete checkout flow in Stripe Test Mode
- [ ] Configure subscription trial period (currently Dec 31, 2026 - verify this)

---

### 8. Email System Verification
**Required Actions:**
- [ ] Verify Resend API key is active and has sufficient quota
- [ ] Set up proper SPF, DKIM, and DMARC records for `santellehealth.com`
- [ ] Test email deliverability (use tools like mail-tester.com)
- [ ] Verify `waitlist@santellehealth.com` is properly configured
- [ ] Set up email monitoring for bounces and spam complaints
- [ ] Create unsubscribe preferences center (partially done)
- [ ] Test all email templates in major email clients (Gmail, Outlook, Apple Mail)
- [ ] Add email rate limiting to prevent abuse
- [ ] Set up dedicated IP address (optional, recommended for high volume)

---

### 9. Database & Data Management
**Required Actions:**
- [ ] Verify Supabase database schema is complete:
  - `profiles` table (appears complete)
  - Create `orders` table for order fulfillment tracking
  - Create `shipments` table for tracking information
  - Create `support_tickets` table (if building custom support)
- [ ] Set up database backups (automated daily backups)
- [ ] Configure Row Level Security (RLS) policies in Supabase
- [ ] Create database indexes for performance
- [ ] Set up monitoring for database performance
- [ ] Implement data retention policies (GDPR compliance)
- [ ] Test database recovery procedures
- [ ] Set up database migration system

---

### 10. Security Hardening
**Required Actions:**
- [ ] Verify SSL/TLS certificate is properly configured
- [ ] Enable HSTS (HTTP Strict Transport Security) - partially done in middleware
- [ ] Implement rate limiting on all API endpoints:
  - Login attempts
  - Email submissions
  - Quiz submissions
  - Contact form
- [ ] Add CAPTCHA to prevent bot submissions (e.g., hCaptcha, reCAPTCHA)
- [ ] Implement CSRF protection
- [ ] Add API key rotation policy
- [ ] Set up security monitoring and alerts
- [ ] Implement IP blocking for malicious actors
- [ ] Enable 2FA for admin accounts
- [ ] Conduct security audit/penetration testing
- [ ] Set up Web Application Firewall (WAF) via Netlify or Cloudflare
- [ ] Implement Content Security Policy (CSP) - partially done

---

### 11. Analytics & Tracking
**Required Actions:**
- [ ] Verify Google Analytics 4 is properly configured
- [ ] Set up e-commerce tracking in GA4:
  - Track checkout initiation
  - Track purchase completion
  - Track subscription cancellations
  - Track revenue
- [ ] Set up conversion goals:
  - Waitlist signups
  - Quiz completions
  - Checkout completions
  - Account creations
- [ ] Implement Stripe revenue analytics
- [ ] Set up funnel analysis (Homepage → Quiz → Plans → Checkout → Purchase)
- [ ] Add tracking for customer lifetime value (LTV)
- [ ] Set up cohort analysis for subscription retention
- [ ] Create dashboard for key metrics:
  - MRR (Monthly Recurring Revenue)
  - ARR (Annual Recurring Revenue)
  - Churn rate
  - Customer acquisition cost (CAC)
  - LTV/CAC ratio
- [ ] Set up Google Tag Manager (optional, for easier tag management)

---

## ⚡ MEDIUM PRIORITY - Complete Within 2-4 Weeks

### 12. Testing & Quality Assurance
**Required Actions:**
- [ ] Create comprehensive test plan covering:
  - User registration flow
  - Quiz completion flow
  - Subscription purchase flow (all 6 plans)
  - Payment success/failure scenarios
  - Account management flow
  - Subscription cancellation flow
- [ ] Test on multiple browsers:
  - Chrome/Edge
  - Safari
  - Firefox
  - Mobile Safari (iOS)
  - Chrome Mobile (Android)
- [ ] Test on multiple devices:
  - Desktop (various screen sizes)
  - Tablet (iPad, Android tablets)
  - Mobile (iPhone, Android phones)
- [ ] Test email templates on all major email clients
- [ ] Perform load testing (simulate 100+ concurrent users)
- [ ] Test checkout flow with different payment methods:
  - Credit cards (Visa, Mastercard, Amex)
  - Declined cards
  - Expired cards
- [ ] Test subscription lifecycle:
  - Trial start
  - Trial end
  - First billing
  - Recurring billing
  - Cancellation
  - Reactivation
- [ ] Test all error scenarios and error messages
- [ ] Accessibility testing (WCAG 2.1 AA compliance)
- [ ] Performance testing (Lighthouse scores, Core Web Vitals)

---

### 13. Customer Experience Enhancements
**Required Actions:**
- [ ] Create onboarding email sequence for new subscribers:
  - Welcome email (day 0)
  - How to use the kit (day 3)
  - App features walkthrough (day 7)
  - Trial ending reminder (2 days before)
- [ ] Add order tracking functionality
- [ ] Create customer dashboard with:
  - Upcoming shipments
  - Order history
  - Quiz results history
  - Subscription details
- [ ] Add personalized product recommendations based on quiz
- [ ] Implement referral program (optional)
- [ ] Add loyalty/rewards program (optional)
- [ ] Create post-purchase survey
- [ ] Set up automated review/feedback requests

---

### 14. Marketing & SEO
**Required Actions:**
- [ ] Verify meta tags are optimized for all pages
- [ ] Create Open Graph images for social sharing
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Set up Google My Business profile
- [ ] Create social media profiles (Instagram, Facebook, LinkedIn)
- [ ] Set up Facebook Pixel for ad tracking
- [ ] Create ad tracking for other platforms (TikTok, Pinterest if applicable)
- [ ] Set up conversion tracking for ads
- [ ] Optimize images for web (already using Next.js Image)
- [ ] Implement structured data (JSON-LD schema) for:
  - Product pages
  - Organization
  - Breadcrumbs
- [ ] Create blog for content marketing (optional)

---

### 15. Monitoring & Maintenance
**Required Actions:**
- [ ] Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Configure error tracking (e.g., Sentry, LogRocket)
- [ ] Set up log aggregation and analysis
- [ ] Create alert system for critical errors:
  - Payment failures
  - Website downtime
  - Database errors
  - Email delivery failures
- [ ] Set up weekly/monthly analytics reports
- [ ] Create backup and disaster recovery plan
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Set up on-call rotation (if team)

---

## 💡 NICE TO HAVE - Post-Launch Improvements

### 16. Advanced Features
- [ ] Apple Sign-In implementation (currently placeholder)
- [ ] Google Sign-In
- [ ] Abandoned cart recovery emails
- [ ] Dynamic pricing based on location/currency
- [ ] Multi-language support (German, French, Italian for Switzerland)
- [ ] Subscription gifting
- [ ] Pre-paid subscriptions (e.g., 6 months upfront)
- [ ] Subscription pause feature
- [ ] Product bundles and upsells
- [ ] Affiliate program
- [ ] Partner/B2B pricing tiers

### 17. Admin Dashboard
- [ ] Create comprehensive admin panel:
  - User management
  - Order management
  - Subscription management
  - Analytics dashboard
  - Email template management
  - Content management
  - Support ticket management
- [ ] Role-based access control (RBAC)
- [ ] Audit log for admin actions

### 18. Mobile App Considerations
- [ ] Plan for mobile app integration
- [ ] API for mobile app
- [ ] Deep linking from web to app
- [ ] Progressive Web App (PWA) features

---

## ✅ PRE-LAUNCH CHECKLIST (FINAL 48 HOURS)

### Critical Pre-Launch Verification
- [ ] All environment variables are set in production (Netlify)
- [ ] All API keys are production keys (not test keys)
- [ ] Stripe is in live mode (not test mode)
- [ ] Stripe webhook URL is configured: `https://santellehealth.com/webhook`
- [ ] Stripe webhook secret is set in production environment
- [ ] DNS records are properly configured
- [ ] SSL certificate is valid
- [ ] Email deliverability is tested and working
- [ ] All legal pages are published (Terms, Privacy, Refund Policy)
- [ ] Customer support channels are ready and monitored
- [ ] Payment processing is tested end-to-end in production
- [ ] Database backups are configured and tested
- [ ] Error monitoring is active (Sentry or similar)
- [ ] Uptime monitoring is configured
- [ ] Google Analytics is tracking properly
- [ ] All team members have access to necessary systems
- [ ] Emergency contact list is prepared
- [ ] Rollback plan is documented
- [ ] Post-launch monitoring schedule is set

### Performance Verification
- [ ] Lighthouse score > 90 for Performance
- [ ] Lighthouse score > 90 for Accessibility
- [ ] Lighthouse score > 90 for Best Practices
- [ ] Lighthouse score > 90 for SEO
- [ ] Core Web Vitals are in "Good" range
- [ ] Page load time < 3 seconds on 3G
- [ ] Time to Interactive < 5 seconds

### Legal Verification
- [ ] Terms of Service reviewed by legal counsel
- [ ] Privacy Policy complies with GDPR
- [ ] Refund policy is clear and fair
- [ ] Medical disclaimers are appropriate
- [ ] Age verification is in place (if required)
- [ ] Data processing agreements are signed with vendors

---

## 📊 IMMEDIATE POST-LAUNCH TASKS

### Week 1
- [ ] Monitor all systems 24/7
- [ ] Track conversion rates at each funnel step
- [ ] Monitor customer support channels closely
- [ ] Fix any critical bugs immediately
- [ ] Collect user feedback
- [ ] Monitor payment success rates
- [ ] Check email deliverability rates
- [ ] Review analytics data daily

### Week 2-4
- [ ] Analyze user behavior patterns
- [ ] Optimize conversion funnel based on data
- [ ] Address all customer feedback
- [ ] Implement high-priority improvements
- [ ] Start A/B testing key pages
- [ ] Ramp up marketing efforts
- [ ] Build email nurture campaigns

---

## 🚀 ESTIMATED TIMELINE

**Critical Tasks (Pre-Launch):** 2-3 weeks
- Stripe webhooks: 3-5 days
- Email system: 2-3 days
- Order fulfillment system: 5-7 days
- Legal documents: 3-5 days
- Testing: 3-5 days

**High Priority (Week 1):** 1 week
- Security hardening: 2-3 days
- Analytics setup: 1-2 days
- Database optimization: 1-2 days

**Medium Priority (Week 2-4):** 2-3 weeks
- Customer experience enhancements: 1 week
- Marketing & SEO: 1 week
- Advanced testing: 1 week

**Total Estimated Time to Production-Ready:** 4-6 weeks

---

## 📞 SUPPORT & RESOURCES

### Key Contacts
- **Development Team:** [Your team contacts]
- **Customer Support:** [Support email/phone]
- **Emergency Contact:** [24/7 contact]

### Documentation
- Stripe API: https://stripe.com/docs
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
- Resend: https://resend.com/docs

### Monitoring URLs
- **Production Site:** https://santellehealth.com
- **Netlify Dashboard:** [Your Netlify URL]
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Supabase Dashboard:** [Your Supabase URL]
- **Analytics:** [Your GA4 URL]

---

## 🎯 SUCCESS METRICS

### Define Success Criteria
- [ ] **Conversion Rate:** > 2% (waitlist to paid subscriber)
- [ ] **Payment Success Rate:** > 98%
- [ ] **Email Deliverability:** > 95%
- [ ] **Customer Support Response Time:** < 24 hours
- [ ] **Website Uptime:** > 99.9%
- [ ] **Churn Rate:** < 5% monthly
- [ ] **Customer Satisfaction:** > 4.5/5 stars

---

**Last Updated:** November 3, 2025
**Status:** Pre-Launch
**Next Review Date:** [Set date for review]

