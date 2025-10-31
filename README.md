# Santelle Website

**Your vaginal health companion - At-home testing kit for women's wellness**

A modern, full-stack web application for Santelle Health, featuring subscription management, user authentication, and a comprehensive health quiz system.

## 🚀 Live Website
**URL:** https://santellehealth.com

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.4.1 (App Router)
- **React:** 19.1.0
- **TypeScript:** 5.x
- **Styling:** Tailwind CSS 4.0
- **Animations:** Framer Motion 12.23.12
- **UI Components:** Custom components with glassmorphic design

### Backend & Services
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email OTP, Apple Sign-In)
- **Payments:** Stripe (Subscriptions, Checkout, Billing Portal)
- **Email:** Resend
- **Serverless Functions:** Netlify Functions
- **Analytics:** Google Analytics (optional)

### Deployment
- **Hosting:** Netlify
- **Domain:** GoDaddy
- **CI/CD:** Automatic deployments from Git branches

### Key Dependencies
- `@supabase/supabase-js` - Database and authentication
- `stripe` - Payment processing
- `resend` - Email delivery
- `framer-motion` - Animations
- `canvas-confetti` - Celebration effects
- `lottie-react` - Lottie animations
- `dompurify` - XSS protection

## 📁 Project Structure

```
Santelle_Website/
├── netlify/
│   └── functions/              # Serverless functions
│       ├── create-checkout-session.ts
│       ├── create-portal-session.ts
│       └── stripe-webhook.ts
├── public/                     # Static assets
│   ├── fonts/                 # Custom fonts (Chunko-Bold.otf)
│   ├── *.png, *.webp, *.svg   # Images, logos, and assets
│   ├── robots.txt
│   ├── sitemap.xml
│   └── manifest.json
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── api/              # API routes
│   │   │   ├── account/      # Account management APIs
│   │   │   ├── contact/      # Contact form endpoint
│   │   │   ├── quiz/         # Quiz submission endpoint
│   │   │   ├── resubscribe/  # Email resubscribe
│   │   │   ├── stripe/       # Stripe API routes
│   │   │   ├── subscribe/    # Waitlist signup
│   │   │   └── unsubscribe/  # Email unsubscribe
│   │   ├── account/          # Account management page
│   │   ├── auth/             # Authentication page (OTP)
│   │   ├── contact-us/       # Contact page
│   │   ├── plans/            # Subscription plans page
│   │   ├── privacy-policy/   # Privacy policy page
│   │   ├── quiz/             # Health quiz page
│   │   ├── resubscribe/      # Resubscribe page
│   │   ├── unsubscribe/      # Unsubscribe page
│   │   ├── waitlist/         # Waitlist page
│   │   ├── layout.tsx        # Root layout with metadata
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── home/             # Homepage sections
│   │   │   ├── FooterSection.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── KitSection.tsx
│   │   │   ├── MobileUnifiedCard.tsx
│   │   │   ├── StatsSection.tsx
│   │   │   └── TeamSection.tsx
│   │   ├── shared/           # Shared components
│   │   │   ├── EmailForm.tsx
│   │   │   ├── LazyImage.tsx
│   │   │   ├── LazyText.tsx
│   │   │   └── SmoothScroll.tsx
│   │   ├── ConditionalNavigation.tsx
│   │   ├── MobileNavBar.tsx
│   │   ├── NavBar.tsx
│   │   ├── PageTransitionWrapper.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Authentication context
│   ├── hooks/                # Custom React hooks
│   │   └── useAuth.ts        # Auth hook
│   ├── lib/                  # Utilities and configurations
│   │   ├── analytics.ts      # Analytics configuration
│   │   ├── auth.ts           # Auth utilities
│   │   ├── auth-server.ts    # Server-side auth
│   │   ├── supabase.ts       # Supabase client setup
│   │   └── technicalData.ts  # Technical specifications
│   ├── middleware/           # Middleware utilities
│   │   ├── errorHandler.ts  # Error handling
│   │   └── validation.ts     # Validation utilities
│   └── styles/               # Custom CSS
│       ├── mobile.css        # Mobile-specific styles
│       └── typography.css     # Typography styles
├── middleware.ts             # Next.js middleware (security headers)
├── netlify.toml              # Netlify configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── eslint.config.mjs         # ESLint configuration
├── postcss.config.mjs        # PostCSS configuration
└── package.json
```

## ✨ Features

### 🔐 Authentication & User Management
- **Email OTP Authentication** - Passwordless email verification
- **Apple Sign-In** - Social authentication via Apple
- **Protected Routes** - Route-level authentication guards
- **Session Management** - Automatic session handling with Supabase
- **Account Dashboard** - User profile and subscription management

### 💳 Payment & Subscription System
- **Stripe Integration** - Full Stripe subscription management
- **Multiple Plans** - Proactive, Balanced, and Essential plans
- **Billing Cycles** - Monthly, bi-monthly, quarterly, and annual options
- **Checkout Flow** - Secure Stripe Checkout integration
- **Billing Portal** - Stripe Customer Portal for subscription management
- **Webhook Handling** - Real-time subscription status updates
- **Trial Periods** - Automated trial management

### 📋 Health Quiz System
- **Interactive Quiz** - Multi-step health assessment
- **Plan Recommendations** - AI-driven plan suggestions based on quiz answers
- **Results Tracking** - Quiz responses stored in database

### 📧 Email System
- **Waitlist Signup** - Automated welcome emails via Resend
- **Contact Form** - Admin notification emails
- **Email Validation** - Real-time domain checking
- **Unsubscribe/Resubscribe** - Email list management

### 🎨 UI/UX Features
- **Responsive Design** - Mobile-first with dedicated mobile components
- **Glassmorphic Design** - Modern glassmorphism UI elements
- **Smooth Animations** - Framer Motion page transitions
- **Lazy Loading** - Optimized image and content loading
- **Custom Typography** - Chunko-Bold font and modern typefaces
- **Video Backgrounds** - Dynamic desktop video backgrounds
- **Keyboard Navigation** - Arrow key navigation between sections

### 🔒 Security Features
- **Content Security Policy** - Comprehensive CSP headers
- **XSS Protection** - DOMPurify integration for input sanitization
- **Security Headers** - X-Frame-Options, HSTS, and more
- **Rate Limiting** - Client-side spam protection
- **Input Validation** - Server-side validation middleware
- **HTTPS Only** - Secure connections enforced

### 🔍 SEO & Performance
- **Meta Tags** - Comprehensive Open Graph and Twitter cards
- **Structured Data** - JSON-LD schema markup
- **Sitemap** - XML sitemap for search engines
- **Robots.txt** - Search engine crawling rules
- **Image Optimization** - Next.js Image component with lazy loading
- **Code Splitting** - Automatic route-based splitting

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (recommended: 20.x)
- **npm** or **yarn**
- **Supabase Account** - For database and authentication
- **Stripe Account** - For payment processing
- **Resend Account** - For email delivery
- **Netlify Account** - For deployment (optional for local dev)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd Santelle_Website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Email Service
   RESEND_API_KEY=your_resend_api_key

   # Analytics (Optional)
   NEXT_PUBLIC_GA_ID=your_google_analytics_id
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe Dashboard → Developers → Webhooks |
| `RESEND_API_KEY` | Resend API key | Resend Dashboard → API Keys |
| `NEXT_PUBLIC_APP_URL` | Application URL | Your domain or localhost URL |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics tracking ID |

## 📦 Key Packages & Versions

- `next`: 15.4.1
- `react`: 19.1.0
- `react-dom`: 19.1.0
- `typescript`: ^5
- `tailwindcss`: ^4
- `@supabase/supabase-js`: ^2.52.0
- `stripe`: ^19.1.0
- `resend`: ^4.7.0
- `framer-motion`: ^12.23.12

## 🚀 Deployment

### Netlify Deployment

The project is configured for automatic deployment on Netlify:

1. **Connect Repository** - Link your Git repository to Netlify
2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
3. **Set Environment Variables** - Add all required env vars in Netlify dashboard
4. **Configure Functions** - Netlify will automatically detect functions in `netlify/functions/`
5. **Set Up Stripe Webhook** - Configure webhook URL in Stripe dashboard:
   - Production: `https://your-domain.com/webhook`
   - Development: Use Stripe CLI for local testing

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Local Stripe Testing

Use Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhook
```

## 🏗️ Architecture

### Authentication Flow
1. User requests OTP via email
2. Supabase sends verification code
3. User enters code → session created
4. Session stored in localStorage (client-side)
5. Protected routes check session via `AuthContext`

### Subscription Flow
1. User selects plan on `/plans` page
2. If not authenticated → redirect to `/auth`
3. After auth → checkout session created via Netlify Function
4. Stripe Checkout redirects user to payment
5. After payment → webhook updates user profile in Supabase
6. User can manage subscription via Stripe Customer Portal

### Database Schema
- **profiles** - User profile data linked to Supabase Auth users
- **subscriptions** - Stripe subscription data (synced via webhooks)

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use Service Role Key Only on Server** - Never expose in client code
3. **Validate All Inputs** - Use validation middleware
4. **Sanitize User Content** - DOMPurify for any user-generated content
5. **Rate Limit APIs** - Implement rate limiting for public endpoints
6. **Secure Headers** - Middleware enforces security headers

## 📊 Performance Optimization

- **Image Optimization** - Next.js Image component with lazy loading
- **Code Splitting** - Automatic route-based splitting
- **Lazy Loading** - Components and images load on demand
- **Font Optimization** - Custom fonts optimized with `next/font`
- **Bundle Analysis** - Use `@next/bundle-analyzer` for optimization

## 🤝 Contributing

### Development Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow existing code style
   - Write clear commit messages
   - Test your changes locally

3. **Test Locally**
   ```bash
   npm run dev
   npm run lint
   ```

4. **Commit Your Changes**
   ```bash
   git commit -m "Add: description of changes"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub/GitLab

### Code Style Guidelines

- **TypeScript** - Strict mode enabled, type everything
- **Components** - Use functional components with hooks
- **Naming** - PascalCase for components, camelCase for functions
- **File Structure** - One component per file
- **Imports** - Use absolute imports via `@/` alias

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks

## 🐛 Troubleshooting

### Common Issues

**Stripe Webhook Not Working**
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check Netlify function logs
- Ensure webhook URL is correct in Stripe dashboard

**Authentication Issues**
- Verify Supabase environment variables
- Check Supabase project settings
- Ensure email templates are configured in Supabase

**Build Failures**
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)

**Environment Variables Not Loading**
- Ensure file is named `.env.local` (not `.env`)
- Restart dev server after adding new variables
- Check variable names match exactly (case-sensitive)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

## 📄 License

This project is proprietary and confidential. All rights reserved by Santelle Health.

## 📞 Contact

- **Website:** https://santellehealth.com
- **Email:** hello@santellehealth.com
- **Contact Form:** https://santellehealth.com/contact-us

---

**To Her Health** 🌸
