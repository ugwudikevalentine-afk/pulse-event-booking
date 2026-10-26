
PULSE - Event Booking SaaS Starter Kit
A modern, production-ready event booking platform built with Next.js 16, TypeScript, PostgreSQL, and Stripe. Launch your own ticketing business in minutes.

Features
Event creation and management (admin panel)
Ticket types with pricing, capacity, and sale windows
Stripe Checkout integration for payments
User registration, login, and email verification
Password reset flow
User dashboard with booking history
Booking cancellation
Admin dashboard with analytics
Admin user management (activate/deactivate, role change)
CSV export (bookings and users)
Search, category filtering, and pagination
Toast notifications
Scroll animations (Framer Motion)
Responsive design (mobile-first)
SEO optimized (sitemap, robots.txt, metadata)
Rate limiting on sensitive endpoints
Zod validation on all inputs
Tech Stack
Layer    Technology
Framework    Next.js 16 (App Router, Turbopack)
Language    TypeScript
Styling    Tailwind CSS v4 + shadcn/ui (Base UI)
Database    PostgreSQL
ORM    Prisma 6
Auth    NextAuth.js v5 (Credentials)
Payments    Stripe (2026 API)
Email    Resend
Validation    Zod
Animations    Framer Motion
Icons    Lucide
Fonts    Noto Sans + Playfair Display
Prerequisites
Node.js 20+ (download)
PostgreSQL database (free at Neon, Supabase, or Railway)
Stripe account (free at stripe.com)
Resend account (free at resend.com)
Installation
1. Extract and install dependencies
Bash

cd pulse-event-booking
npm install
2. Set up environment variables
Bash

cp .env.example .env
Open .env and fill in your values (see sections below).

3. Set up the database
Bash

npx prisma generate
npx prisma db push
4. Seed the database (optional)
This creates a demo admin account and sample events:

Bash

npx tsx src/lib/seed.ts
Default admin login:

Email: admin@eventbook.com
Password: admin123
Important: Change the admin password immediately after first login.

5. Start the development server
Bash

npm run dev
Open http://localhost:3000.

Environment Setup
Database (DATABASE_URL)
Get a free PostgreSQL database:

Go to neon.tech and sign up
Create a new project
Copy the connection string
Paste it into .env as DATABASE_URL
Example:

text

DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
Auth Secret (AUTH_SECRET)
Generate a random secret:

Bash

npx auth secret
Copy the output into .env as AUTH_SECRET.

Stripe (STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET)
Go to dashboard.stripe.com/apikeys
Copy your Secret key (starts with sk_test_)
For the webhook secret, see "Stripe Webhooks" section below
Resend (RESEND_API_KEY)
Go to resend.com/api-keys
Create an API key
Paste it into .env
Free tier: 100 emails/day, sends from onboarding@resend.dev
To use your own domain, verify it in Resend and update RESEND_FROM_EMAIL
Stripe Webhooks (Local Testing)
Install the Stripe CLI: docs.stripe.com/stripe-cli
Log in:
Bash

stripe login
Forward webhooks to your local server:
Bash

stripe listen --forward-to localhost:3000/api/webhooks/stripe
Copy the webhook signing secret (starts with whsec_) and add it to .env as STRIPE_WEBHOOK_SECRET
In a separate terminal, trigger a test event:
Bash

stripe trigger checkout.session.completed
Production Deployment
Vercel (Recommended)
Push your code to GitHub
Import the project at vercel.com
Add all environment variables in Vercel dashboard
Deploy
Other platforms
PULSE works on any platform that supports Node.js 20+:

Railway
Fly.io
DigitalOcean App Platform
AWS / GCP / Azure
Project Structure
text

src/
  app/
    api/           # API routes (auth, bookings, checkout, webhooks, admin)
    admin/         # Admin dashboard pages
    booking/       # Booking success/cancel pages
    dashboard/     # User dashboard pages
    events/        # Event listing and detail pages
    login/         # Login page
    register/      # Registration page
    forgot-password/
    reset-password/
    verify-email/
  auth.ts          # NextAuth configuration
  proxy.ts         # Route protection middleware
  components/
    motion/        # Scroll animations
    providers/     # Session provider
    ui/            # shadcn/ui components
  lib/
    prisma.ts      # Database client
    email.ts       # Resend email helper
    rate-limit.ts  # Rate limiter
    seed.ts        # Database seeder
    utils.ts       # Utility functions
prisma/
  schema.prisma    # Database schema
Customization
Colors
Edit src/app/globals.css and change the @theme tokens.

Fonts
Edit src/app/layout.tsx to change the Google Fonts imports.

Branding
App name: Search and replace "PULSE" across the codebase
Logo: Replace src/app/favicon.ico and update the navbar
Emails: Update RESEND_FROM_EMAIL in .env
Support
For questions or issues, contact the developer through the marketplace where you purchased this item.

License
See the LICENSE file included with this package.

Changelog
See CHANGELOG.md for version history.
