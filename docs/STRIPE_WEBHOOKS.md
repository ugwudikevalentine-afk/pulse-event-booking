
Stripe Webhooks Setup Guide
Webhooks let Stripe notify your app when a payment succeeds, fails, or is refunded. Without webhooks, bookings will stay in "PENDING" status even after payment.

Local Development
Step 1: Install the Stripe CLI
Mac: brew install stripe/stripe-cli/stripe
Windows: Download from github.com/stripe/stripe-cli/releases
Linux: See docs.stripe.com/stripe-cli
Step 2: Log in
Bash

stripe login
This opens your browser. Click "Allow" to authorize.

Step 3: Forward webhooks to your local server
Bash

stripe listen --forward-to localhost:3000/api/webhooks/stripe
You will see output like:

text

> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxx
Step 4: Add the signing secret to .env
text

STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxx"
Step 5: Test it
Open a second terminal and run:

Bash

stripe trigger checkout.session.completed
Check your terminal running stripe listen — you should see the event come through.

Production Deployment
Step 1: Go to Stripe Dashboard
Open dashboard.stripe.com/webhooks
Click "Add endpoint"
Step 2: Configure the endpoint
URL: https://yourdomain.com/api/webhooks/stripe
Events to listen for:
checkout.session.completed
checkout.session.expired
payment_intent.payment_failed
charge.refunded
Step 3: Copy the signing secret
After saving, click "Reveal" next to Signing secret and copy the whsec_... value.

Step 4: Add to your hosting environment
Vercel: Dashboard > Settings > Environment Variables
Railway: Dashboard > Variables
Other: Add STRIPE_WEBHOOK_SECRET to your server environment
Troubleshooting
Problem    Solution
Webhook returns 400    Check that STRIPE_WEBHOOK_SECRET matches exactly
Webhook returns 500    Check server logs for Prisma/database errors
Events not arriving    Make sure your server is running and publicly accessible
Duplicate events    Stripe may retry — the webhook handler is idempotent
Test mode vs Live mode    Webhook secrets are different for each — use the right one
Important Notes
Always use test mode keys (sk_test_...) during development
Switch to live mode keys (sk_live_...) only when ready for real money
The webhook endpoint must be publicly accessible (localhost only works with Stripe CLI)
Never share your webhook signing secret publicly
