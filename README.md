# Santelle Website

## Tech Stack
- **Frontend:** Next.js (React, TypeScript)
- **Styling:** Tailwind CSS
- **Backend:** (Planned) Node.js/Express or Django
- **E-commerce:** (Planned) Snipcart/Shopify integration
- **CMS:** (Planned) Sanity/Contentful/Strapi
- **Auth:** (Planned) Auth0/Firebase
- **Analytics:** (Planned) PostHog/Plausible, Sentry

## Folder Structure
```
website/
  ├── public/                # Static assets (images, videos, favicon)
  ├── src/
  │   ├── app/               # Next.js app directory (routes/pages)
  │   │   ├── how-it-works/
  │   │   ├── science-trust/
  │   │   ├── shop/
  │   │   ├── blog/
  │   │   │   └── [slug]/
  │   │   ├── account/
  │   │   ├── contact/
  │   │   ├── wearable/
  │   │   ├── app-demo/
  │   │   └── privacy-security/
  │   ├── components/        # Reusable UI components
  │   ├── styles/            # Custom CSS (typography, theme)
  │   ├── lib/               # API clients, utilities
  │   └── context/           # React context (auth, cart, etc.)
  ├── .env.example           # Environment variable template
  ├── tailwind.config.js     # Tailwind CSS config
  ├── postcss.config.js      # PostCSS config
  ├── next.config.js         # Next.js config
  ├── package.json
  └── README.md
```

## Pages & Features
- Homepage: Hero, Product Intro, Testimonials, CTA
- How It Works: Step-by-step visuals, FAQs
- Science & Trust: Validation, Team, Compliance
- Shop: E-commerce, Subscriptions
- Blog/Education: Articles, Wellness Tips
- Account Portal: Results, Orders, Recommendations
- Contact & Support: Help Center, Chatbot, Form
- Wearable Product: Features, Tech, Demo
- App Demo: Screenshots, User Journey
- Data Privacy & Security: Encryption, Data Handling

## Getting Started
1. `cd website`
2. `npm install`
3. `npm run dev`

---

This project is scaffolded for rapid development and future integrations. See comments in code for integration points.
