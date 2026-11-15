Shanti Dham Temple -- Donation & Pooja Booking Platform
A temple seva management website built with Next.js 14, React
18, JavaScript and CSS. Devotees can explore donation packages, submit
a donation, book a pooja for an available date and time, and view their
receipts. Temple administrators can manage donation packages, bookings
and receipt records through a protected admin dashboard.
Project note: This repository contains a student/demo
implementation. Donations use a simulated payment flow and are marked
as paid by the application; no real UPI, card or net-banking
transaction is processed. Do not use this version to collect real
donations without integrating and testing a payment gateway.

Features
For devotees
- Browse temple donation packages and suggested contribution amounts.
- View available pooja options, prices, dates and time slots.
- Book a pooja by entering devotee and contact details.
- Check time-slot capacity before a booking is confirmed.
- Receive a unique reference ID for a donation or booking.
- Look up and print receipt details.
For administrators
- Sign in through a protected admin login.
- View dashboard summaries for donations, pooja bookings and receipts.
- Add, edit and manage donation packages.
- Review pooja bookings and their statuses.
- View donation and booking receipt records.
Application features
- Responsive interface for desktop and mobile browsers.
- Server-side input validation.
- Protected admin pages and API routes.
- Admin session signed with HMAC-SHA256 and configured to expire after
  eight hours.
- JSON-file storage with serialized writes.
- Next.js metadata, sitemap and robots configuration.
Technology Stack
  Technology        Usage
  Next.js 14.2.18   App framework, App Router, pages and API routes
React 18          Interactive user interface
JavaScript        Application logic
CSS               Styling and responsive layout
Node.js 18.18+    Runtime environment
JSON file         Local demo data storage
Getting Started
Prerequisites
Install: - Node.js 18.18 or later - npm - A modern web browser

Check your installed versions:
node -v
npm -v
1. Clone the repository
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
Move into the project folder:
cd temple-seva
Replace the repository URL and folder name with your actual GitHub
details if they are different.
2. Install dependencies
npm install
3. Configure environment variables
Create a local environment file by copying the example:

Windows PowerShell
Copy-Item .env.example .env.local
macOS / Linux
cp .env.example .env.local
Open .env.local and set your own values:
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-characters
NEXT_PUBLIC_SITE_URL=http://localhost:3000
Important: - Use a strong, unique admin password. - Set AUTH_SECRET to
a long, random value. - Never commit .env.local or share its contents
publicly. - The .env.example file is a template; keep real credentials
only in your local or hosting environment settings.
4. Run the development server
npm run dev
Open http://localhost:3000 in your browser.
5. Build for production
To check whether the project builds successfully:
npm run build
To start the production server after a successful build:
npm start
Main Routes
  Route               Description
  /                 Home page and donation package highlights
/donate           Browse donation packages
/donate/[id]      Donation form for a selected package
/booking          Pooja booking form and calendar/slot selection
/receipt          Find a receipt using its reference
/receipt/[id]     View and print a receipt
/admin/login      Administrator login
/admin            Admin dashboard
/admin/packages   Manage donation packages
/admin/bookings   Review bookings
/admin/receipts   View receipt records

## 📁 Project Structure

```text
temple-seva/
│
├── app/
│   ├── (site)/                 # Public website pages
│   ├── donate/                 # Donation pages
│   ├── booking/                # Pooja booking page
│   ├── receipt/                # Receipt lookup and details
│   ├── admin/                  # Admin login and dashboard
│   ├── api/                    # API routes
│   │   ├── auth/                # Admin login/logout
│   │   ├── bookings/            # Booking APIs
│   │   ├── donations/           # Donation APIs
│   │   ├── packages/            # Donation package APIs
│   │   └── slots/               # Available time-slot API
│   ├── globals.css              # Global styles
│   ├── layout.js                # Root layout
│   ├── sitemap.js               # Sitemap
│   └── robots.js                # Robots rules
│
├── components/                  # Reusable UI components
│
├── lib/
│   ├── db.js                    # JSON-file storage functions
│   ├── seed.js                  # Initial packages and demo records
│   ├── validate.js              # Form and request validation
│   ├── queries.js               # Data queries and slot availability
│   ├── auth.js                  # Admin authentication helpers
│   ├── session.js               # Session utilities
│   ├── api.js                   # API response helpers
│   ├── client-api.js             # Client-side API helpers
│   ├── ids.js                   # Reference ID generation
│   ├── format.js                # Date and display formatting
│   └── site.js                  # Temple settings
│
├── .env.example                 # Environment variable template
├── .gitignore
├── middleware.js                # Admin page protection
├── next.config.mjs
├── package.json
└── README.md
```



Demo Data and Storage
The application uses a local JSON file at:
data/db.json
When the file does not exist, the application creates it and loads the
starter donation packages, pooja options and sample records from
lib/seed.js.

The data/db.json file is ignored by Git so that local user and demo
records are not committed to the repository. If you want to reset the
local demo data, stop the server and delete data/db.json; the
application will recreate it with the starter data on the next run.

Deployment limitation: Local JSON-file storage is suitable for
development and demonstration, but it is not a reliable shared database
for a multi-instance or serverless production deployment. Use a
persistent database such as PostgreSQL or MongoDB before running the
platform for real users.
Customization
  What you want to change             File
  Temple name, address, phone, email  lib/site.js
and navigation                      

  Colours and typography              app/globals.css and
app/layout.js

  Starter donation packages, poojas   lib/seed.js
and time slots                      

  Form and server-side validation     lib/validate.js

Data storage implementation         lib/db.js
Donation payment integration        app/api/donations/route.js and
related donation pages/API code
If you change the starter data in lib/seed.js after the JSON database
has already been created, delete data/db.json to generate a fresh
database with the updated seed data. This also removes local demo
records.
Payment and Security Notice
- The current donation endpoint creates a donation record and marks it
  as paid as part of a demo-only flow.
- Selecting UPI, Card or Net banking does not initiate or verify a
  real payment.
- Before accepting real donations, integrate a payment provider,
  verify payment status on the server using the provider's recommended
  process, and store transaction references securely.
- Configure strong production credentials and a unique AUTH_SECRET.
- Use HTTPS in production.
- Do not upload .env.local, passwords, API keys, payment secrets or
  data/db.json to GitHub.
- Review privacy, data-retention and applicable legal requirements
  before collecting real devotee information.
  
Available npm Scripts
Command           Purpose
npm install     Install dependencies
npm run dev     Start the local development server
npm run build   Create a production build
npm start       Start the production server

Future Improvements
Possible next steps for a production-ready version: - Integrate a
verified payment gateway such as Razorpay or Stripe. - Replace JSON-file
storage with PostgreSQL or MongoDB. - Add email/SMS booking and donation
confirmations. - Add downloadable PDF receipts. - Add more administrator
roles and audit logs. - Add automated tests and deployment monitoring.
