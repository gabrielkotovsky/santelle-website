# Santelle Website

**Your vaginal health companion - At-home testing kit for women's wellness**

## 🚀 Live Website
**URL:** https://santellehealth.com

## 🛠️ Tech Stack
- **Frontend:** Next.js 15.4.1 (React 19, TypeScript)
- **Styling:** Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Email Service:** Resend
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Netlify
- **Domain:** GoDaddy
- **Analytics:** (Planned) Google Analytics, Microsoft Clarity

## 📁 Project Structure
```
Santelle_Website/
├── public/                  # Static assets
│   ├── fonts/              # Custom fonts (Chunko-Bold.otf)
│   ├── *.png, *.webp       # Images, logos, and demo assets
│   ├── robots.txt          # SEO crawling rules
│   └── sitemap.xml         # Site structure for search engines
├── src/
│   ├── app/                # Next.js app directory
│   │   ├── api/            # API routes
│   │   │   ├── collect-additional-info/  # Additional info collection
│   │   │   ├── contact/    # Contact form endpoint
│   │   │   ├── resubscribe/ # Resubscribe functionality
│   │   │   ├── subscribe/  # Waitlist signup endpoint
│   │   │   └── unsubscribe/ # Unsubscribe functionality
│   │   ├── complete-profile/ # Profile completion page
│   │   ├── contact-us/     # Contact page
│   │   ├── privacy-policy/ # Privacy policy page
│   │   ├── resubscribe/    # Resubscribe page
│   │   ├── unsubscribe/    # Unsubscribe page
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout with metadata
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable UI components
│   │   ├── home/           # Homepage-specific components
│   │   │   ├── FooterSection.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HowItWorksSection.tsx
│   │   │   ├── KitSection.tsx
│   │   │   ├── MobileUnifiedCard.tsx
│   │   │   ├── StatsSection.tsx
│   │   │   └── TeamSection.tsx
│   │   ├── shared/         # Shared components
│   │   │   ├── EmailForm.tsx
│   │   │   ├── LazyImage.tsx
│   │   │   ├── LazyText.tsx
│   │   │   └── SmoothScroll.tsx
│   │   ├── ConditionalNavigation.tsx
│   │   ├── MobileNavBar.tsx
│   │   ├── NavBar.tsx
│   │   └── PageTransitionWrapper.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useMobile.ts    # Mobile detection hook
│   │   └── useWaitlistForm.ts # Form management hook
│   ├── lib/                # Utilities and configurations
│   │   ├── analytics.ts    # Analytics configuration
│   │   ├── supabase.ts     # Supabase client setup
│   │   └── technicalData.ts # Technical specifications
│   ├── middleware/         # Middleware utilities
│   │   ├── errorHandler.ts # Error handling middleware
│   │   └── validation.ts   # Validation middleware
│   └── styles/             # Custom CSS modules
│       ├── mobile.css      # Mobile-specific styles
│       └── typography.css  # Typography styles
├── middleware.ts           # Security headers and middleware
├── tailwind.config.js      # Tailwind configuration
├── eslint.config.mjs       # ESLint configuration
├── postcss.config.mjs      # PostCSS configuration
├── package.json
└── README.md
```

## ✨ Implemented Features

### 🏠 **Pages**
- **Homepage**: Hero section, product introduction, team showcase, waitlist signup
- **Complete Profile**: Profile completion and onboarding
- **Contact Us**: Contact form with email validation and rate limiting
- **Privacy Policy**: Legal compliance page
- **Resubscribe**: Email resubscription functionality
- **Unsubscribe**: Email unsubscription management

### 🔐 **Security Features**
- **Security Headers**: Comprehensive middleware with CSP, X-Frame-Options, etc.
- **Input Validation**: Email format and domain validation
- **Rate Limiting**: Client-side protection against spam
- **HTTPS Only**: All external calls use secure protocols
- **Environment Variables**: Secure API key management
- **Error Handling**: Centralized error handling middleware
- **Validation Middleware**: Input sanitization and validation

### 📧 **Email System**
- **Waitlist Signup**: Automated welcome emails
- **Contact Form**: Notification emails to admin
- **Email Validation**: Real-time domain checking
- **Rate Limiting**: Prevents email spam
- **Resubscribe/Unsubscribe**: Email list management
- **Additional Info Collection**: Enhanced user data gathering

### 🎨 **UI/UX Features**
- **Responsive Design**: Mobile-first approach with dedicated mobile styles
- **Smooth Animations**: Page transitions and micro-interactions
- **Custom Typography**: Chunko-Bold and modern font families
- **Gradient Backgrounds**: Beautiful visual design
- **Interactive Elements**: Hover effects and micro-interactions
- **Lazy Loading**: Optimized image and text loading
- **Smooth Scrolling**: Enhanced user experience
- **Mobile Navigation**: Dedicated mobile navigation components

### 🔍 **SEO Optimization**
- **Meta Tags**: Comprehensive Open Graph and Twitter cards
- **Structured Data**: JSON-LD schema markup
- **Sitemap**: XML sitemap for search engines
- **Robots.txt**: Search engine crawling rules
- **Canonical URLs**: Proper URL structure
- **Heading Hierarchy**: Proper H1, H2, H3 structure

### 📱 **Mobile Experience**
- **Mobile-First Design**: Optimized for mobile devices
- **Responsive Components**: Adaptive layouts for all screen sizes
- **Touch-Friendly Interface**: Optimized for mobile interactions
- **Mobile-Specific Styles**: Dedicated mobile CSS

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd Santelle_Website

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your environment variables:
# RESEND_API_KEY=your_resend_api_key
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Run development server
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Email Service
RESEND_API_KEY=your_resend_api_key

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

## 📊 Performance

- **Lighthouse Score**: Optimized for Core Web Vitals
- **Bundle Size**: Optimized with Next.js 15
- **Image Optimization**: Next.js Image component with lazy loading
- **Font Loading**: Optimized custom font loading
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Images and text content lazy loading

## 🔒 Security

- **Content Security Policy**: Comprehensive CSP headers
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Form security measures
- **Rate Limiting**: API endpoint protection
- **HTTPS Enforcement**: Secure connections only
- **Error Handling**: Secure error messages
- **Input Validation**: Comprehensive validation middleware

## 🚀 Deployment

The website is deployed on **Netlify** with automatic deployments from the main branch.

### Deployment Process
1. Push changes to main branch
2. Netlify automatically builds and deploys
3. Domain: https://santellehealth.com

## 📈 Analytics & Monitoring

- **Search Console**: Google Search Console integration
- **Webmaster Tools**: Bing Webmaster Tools setup
- **Error Tracking**: Centralized error handling
- **Performance Monitoring**: Optimized Core Web Vitals

## 🔮 Future Features

### Planned Enhancements
- **E-commerce Integration**: Product catalog and checkout
- **User Authentication**: Account management system
- **Blog System**: Content management for educational articles
- **Mobile App**: Companion app for test results
- **Analytics Dashboard**: User behavior insights
- **A/B Testing**: Conversion optimization

### Technical Improvements
- **Server-Side Rate Limiting**: Enhanced API protection
- **Input Sanitization**: DOMPurify integration
- **Error Boundaries**: React error handling
- **PWA Features**: Progressive Web App capabilities
- **Internationalization**: Multi-language support
- **Advanced Analytics**: Enhanced user tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved by Santelle Health.

## 📞 Contact

- **Website**: https://santellehealth.com
- **Email**: hello@santellehealth.com
- **Contact Form**: https://santellehealth.com/contact-us

---

**To Her Health** 🌸
