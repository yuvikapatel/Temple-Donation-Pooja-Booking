# Shanti Dham Temple – Donation & Pooja Booking Platform

Next.js 14 (App Router) · JavaScript · plain CSS design system · JSON-file database (zero setup)

## Run
    npm install
    npm run dev        # http://localhost:3000
    npm run build && npm start   # production check

Admin: http://localhost:3000/admin  (admin@temple.local / Temple@123 – change in `.env.local`)

## Change things you don't like
- Name, address, phone, nav links ........ `lib/site.js`
- Colours and fonts ...................... `app/globals.css` (`:root`) and `app/layout.js`
- Starter packages / poojas / time slots . `lib/seed.js` (delete `data/db.json` to re-seed) or edit in the admin panel
- Validation rules ....................... `lib/validate.js`
- Swap the database ...................... `lib/db.js` (only file that touches storage)
- Real payments .......................... `app/api/donations/route.js` and `app/api/bookings/route.js` (currently a demo that marks payments as paid)

## Razorpay payments
1. Create a Razorpay account (razorpay.com). TEST mode works immediately; LIVE mode needs KYC.
2. Dashboard > Account & Settings > API Keys > generate keys.
3. Put them in `.env.local`:
       RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
       RAZORPAY_KEY_SECRET=xxxxxxxx
4. Restart `npm run dev`. In test mode use Razorpay's test UPI/card details (shown in their docs).
5. Optional but recommended once the site is online: add a webhook
   `https://YOUR-DOMAIN/api/payments/webhook` (events: payment.captured, order.paid) and put its secret in `RAZORPAY_WEBHOOK_SECRET`.

Flow: form -> `/api/payments/order` (server validates, holds the seat, creates Razorpay order) -> Razorpay Checkout ->
`/api/payments/verify` (signature check, receipt created). Receipts can no longer be created without a verified payment.
