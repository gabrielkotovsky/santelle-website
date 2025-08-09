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
│   ├── fonts/              # Custom fonts
│   ├── *.png, *.webp       # Images and logos
│   ├── robots.txt          # SEO crawling rules
│   └── sitemap.xml         # Site structure for search engines
├── src/
│   ├── app/                # Next.js app directory
│   │   ├── api/            # API routes
│   │   │   ├── contact/    # Contact form endpoint
│   │   │   └── subscribe/  # Waitlist signup endpoint
│   │   ├── contact-us/     # Contact page
│   │   ├── privacy-policy/ # Privacy policy page
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout with metadata
│   │   └── page.tsx        # Homepage
│   ├── components/         # Reusable UI components
│   │   ├── MobileNavBar.tsx
│   │   ├── NavBar.tsx
│   │   └── PageTransitionWrapper.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useMobile.ts
│   │   └── useWaitlistForm.ts
│   ├── lib/                # Utilities and configurations
│   │   └── supabase.ts     # Supabase client setup
│   └── styles/             # Custom CSS modules
│       ├── mobile.css
│       └── typography.css
├── middleware.ts           # Security headers and middleware
├── tailwind.config.js      # Tailwind configuration
├── package.json
└── README.md
```

## ✨ Implemented Features

### 🏠 **Pages**
- **Homepage**: Hero section, product introduction, team showcase, waitlist signup
- **Contact Us**: Contact form with email validation and rate limiting
- **Privacy Policy**: Legal compliance page

### 🔐 **Security Features**
- **Security Headers**: Comprehensive middleware with CSP, X-Frame-Options, etc.
- **Input Validation**: Email format and domain validation
- **Rate Limiting**: Client-side protection against spam
- **HTTPS Only**: All external calls use secure protocols
- **Environment Variables**: Secure API key management

### 📧 **Email System**
- **Waitlist Signup**: Automated welcome emails
- **Contact Form**: Notification emails to admin
- **Email Validation**: Real-time domain checking
- **Rate Limiting**: Prevents email spam

### 🎨 **UI/UX Features**
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Framer Motion transitions
- **Custom Typography**: Poppins font family
- **Gradient Backgrounds**: Beautiful visual design
- **Interactive Elements**: Hover effects and micro-interactions

### 🔍 **SEO Optimization**
- **Meta Tags**: Comprehensive Open Graph and Twitter cards
- **Structured Data**: JSON-LD schema markup
- **Sitemap**: XML sitemap for search engines
- **Robots.txt**: Search engine crawling rules
- **Canonical URLs**: Proper URL structure
- **Heading Hierarchy**: Proper H1, H2, H3 structure

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
- **Image Optimization**: Next.js Image component
- **Font Loading**: Optimized Google Fonts loading

## 🔒 Security

- **Content Security Policy**: Comprehensive CSP headers
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Form security measures
- **Rate Limiting**: API endpoint protection
- **HTTPS Enforcement**: Secure connections only

## 🚀 Deployment

The website is deployed on **Netlify** with automatic deployments from the main branch.

### Deployment Process
1. Push changes to main branch
2. Netlify automatically builds and deploys
3. Domain: https://santellehealth.com

## 📈 Analytics & Monitoring

- **Search Console**: Google Search Console integration
- **Webmaster Tools**: Bing Webmaster Tools setup
- **Error Tracking**: (Planned) Sentry integration
- **Performance Monitoring**: (Planned) Vercel Analytics

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
