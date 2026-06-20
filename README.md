# LinkForge — Full-Stack URL Shortener & Analytics Platform

![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pg_8.12-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-4.7-DC382D?logo=redis&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

LinkForge is a production-style, full-stack **URL shortening and analytics platform**. A **Next.js** frontend delivers a marketing landing page, secure authentication (signup with **OTP email verification** and **password reset via emailed token**), and a modern dashboard. The **Node/Express** API handles JWT authentication, Base62 short-code generation, custom aliases, and link expiry, while a **Redis read-through cache** keeps redirects fast and **PostgreSQL** serves as the source of truth. Every click is logged with referrer, browser, OS, and device for a rich analytics view, and any link can produce an on-demand QR code. Transactional email is delivered through **Brevo**.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Run the Application](#4-run-the-application)
- [Authentication & Email](#authentication--email)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [How Redirects Stay Fast](#how-redirects-stay-fast)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Link Management
- Create short links with auto-generated **7-character Base62** codes
- Optional **custom aliases** (3–32 alphanumeric characters, uniqueness-checked)
- Set an **expiry date** so links stop resolving after a chosen time
- List all of your links with live **click counts**
- Delete links (cache entry is invalidated automatically)

### Redirects & Caching
- Public redirect endpoint resolves `/:code` to the destination
- **Redis read-through cache** for fast lookups, PostgreSQL as source of truth
- Cached destinations carry a configurable TTL (`CACHE_TTL_SECONDS`, default 1h)
- Click logging runs asynchronously so it never delays the redirect

### Analytics
- Per-click logging: timestamp, referrer, browser, OS, device
- Per-link analytics with totals and breakdowns by **browser / OS / device**
- Daily **click timeline** and a recent-clicks feed (latest 25)
- User-agent parsing via **ua-parser-js**

### Authentication & Security
- Account **register / login** with JWT-based stateless auth
- **Signup OTP verification** — a 6-digit code is emailed; accounts stay inactive until verified
- **Password reset** via a single-use, hashed, expiring token emailed to the user
- Transactional email through **Brevo** (with a console fallback for local dev)
- Passwords hashed with **bcrypt**; OTPs and reset tokens stored as **SHA-256 hashes**
- Protected routes guarded by auth middleware (links are scoped per user)
- **Rate limiting** on auth (10 / 15 min) and shorten (30 / min) endpoints
- Request validation with **Zod**

### Extras
- On-demand **QR code** generation (returned as a data URL) for any link

---

## Tech Stack

### Frontend (`frontend/`)
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.5 | App Router framework & SSR |
| React | 18.3.1 | UI framework |
| Tailwind CSS | 3.4.7 | Utility-first styling |
| PostCSS | 8.4.40 | CSS processing |
| Autoprefixer | 10.4.19 | Vendor prefixing |

The frontend lives in `frontend/` and includes a marketing landing page, login,
signup with **6-digit OTP email verification**, **password reset via emailed
token**, and a professional dashboard (stats, link management, QR codes, and
per-link analytics). Auth state is held client-side via a JWT-backed context.

### Backend (`backend/`)
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | JavaScript runtime (ESM) |
| Express | 4.19.2 | Web framework |
| PostgreSQL (pg) | 8.12.0 | Database & connection pool |
| Redis | 4.7.0 | Read-through cache for redirects |
| JSON Web Token | 9.0.2 | Authentication tokens |
| bcryptjs | 2.4.3 | Password hashing |
| Zod | 3.23.8 | Request schema validation |
| QRCode | 1.5.4 | QR code generation |
| Brevo API | v3 | Transactional email (OTP & password reset) |
| ua-parser-js | 1.0.38 | User-agent parsing for analytics |
| express-rate-limit | 7.4.0 | Endpoint rate limiting |
| CORS | 2.8.5 | Cross-origin resource sharing |
| Dotenv | 16.4.5 | Environment variable management |

---

## Screenshots

### Login / Register
![Authentication](screenshots/auth.png)

### Dashboard — Create & Manage Links
![Dashboard](screenshots/dashboard.png)

### Link Analytics
![Analytics](screenshots/analytics.png)

### QR Code
![QR Code](screenshots/qr.png)

> Add your own images under a `screenshots/` directory to populate this section.

---

## Prerequisites

Make sure the following are installed and running before proceeding:

- [Node.js](https://nodejs.org/) (v18 or later — uses native ESM and `node --watch`)
- [npm](https://www.npmjs.com/) (v9 or later)
- [PostgreSQL](https://www.postgresql.org/) — local instance or hosted cluster
- [Redis](https://redis.io/) — local instance or hosted (e.g. Upstash, Redis Cloud)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/LinkForge.git
cd LinkForge
```

### 2. Install Dependencies

Install packages for the backend and frontend separately:

```bash
# Backend dependencies
cd backend
npm install
cd ..

# Frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure Environment Variables

**Backend** — create `backend/.env` (copy from `backend/.env.example`):

```env
# ── Server ────────────────────────────────────────────────
NODE_ENV=development
PORT=4000
BASE_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000
APP_URL=http://localhost:3000        # frontend URL used in email links

# ── PostgreSQL ────────────────────────────────────────────
DATABASE_URL=postgres://linkforge:linkforge@localhost:5432/linkforge

# ── Redis ─────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=3600

# ── Auth ──────────────────────────────────────────────────
JWT_SECRET=replace_with_a_strong_random_secret
JWT_EXPIRES_IN=7d

# ── Email (Brevo) ─────────────────────────────────────────
# Get an API key at https://app.brevo.com (SMTP & API → API Keys).
# If left blank, OTP/reset emails are printed to the server console.
BREVO_API_KEY=
BREVO_SENDER_EMAIL=no-reply@linkforge.app
BREVO_SENDER_NAME=LinkForge
OTP_TTL_MINUTES=10
RESET_TTL_MINUTES=30
```

**Frontend** — create `frontend/.env.local` (copy from `frontend/.env.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> **Tip:** Generate a strong `JWT_SECRET` before deploying — never reuse the example value.

### 4. Run the Application

First apply the database schema:

```bash
cd backend
npm run migrate          # creates users, links, and clicks tables
```

Then start each service in its own terminal:

```bash
# Backend → http://localhost:4000
cd backend
npm run dev              # node --watch src/index.js

# Frontend → http://localhost:3000
cd frontend
npm install
npm run dev              # next dev
```

- **Next.js frontend** → [http://localhost:3000](http://localhost:3000)
- **Express API** → [http://localhost:4000](http://localhost:4000)
- **Short links resolve at** `http://localhost:4000/<code>`

For production, build the frontend with `npm run build` and serve with `npm start` (from `frontend/`); run the backend with `npm start` (from `backend/`).

### Authentication & Email

Signup now requires email verification:

1. **Sign up** → the API creates an unverified account and emails a 6-digit code.
2. **Verify** → enter the code at `/verify` to activate the account and sign in.
3. **Forgot password** → request a reset; a tokenized link (`/reset-password?token=…`) is emailed.

Emails are sent through **Brevo** (`backend/src/utils/email.js`). Set `BREVO_API_KEY`
to send real mail; without it, every email is logged to the server console so the
flows remain fully testable offline. New tables `email_verifications` and
`password_resets` are created automatically on boot (or via `npm run migrate`).

---

## Project Structure

```
LinkForge/
├── README.md                         # Project overview, setup instructions
├── .gitignore                        # Ignore rules (node_modules, .env, etc.)
├── backend/                           # Node.js + Express API
│   ├── package.json                  # Backend dependencies & scripts
│   ├── .env.example                  # Example backend environment variables
│   └── src/
│       ├── index.js                  # Server entry point (boots HTTP server)
│       ├── app.js                    # Express app factory (routes, middleware)
│       ├── config/                   # Configuration & external clients
│       │   ├── env.js                # Loads & validates environment variables
│       │   ├── db.js                 # PostgreSQL pool + query helper
│       │   └── redis.js              # Redis client
│       ├── db/                       # Database schema & migrations
│       │   ├── schema.sql            # users / links / clicks + verification & reset tables
│       │   └── migrate.js            # Applies schema.sql
│       ├── middleware/               # Express middleware
│       │   ├── auth.js               # JWT verification (authenticate)
│       │   ├── rateLimit.js          # auth & shorten rate limiters
│       │   └── errorHandler.js       # notFound + central error handler
│       ├── controllers/              # Request handlers (business logic)
│       │   ├── authController.js     # register / verify-otp / login / reset / me
│       │   ├── linkController.js     # create / list / delete / QR code
│       │   ├── redirectController.js # public /:code redirect + click logging
│       │   └── analyticsController.js# per-link analytics aggregation
│       ├── routes/                   # Express routers
│       │   ├── auth.js               # /api/auth endpoints
│       │   └── links.js              # /api/links endpoints
│       └── utils/                    # Shared helpers
│           ├── base62.js             # Base62 encode / random code / alias validation
│           ├── email.js              # Brevo transactional email (OTP & reset)
│           └── userAgent.js          # Parse browser / OS / device from UA
└── frontend/                          # Next.js (App Router) + Tailwind UI
    ├── package.json                  # Frontend dependencies & scripts
    ├── next.config.mjs               # Next.js configuration
    ├── tailwind.config.js            # Tailwind CSS configuration
    ├── postcss.config.mjs            # PostCSS configuration
    ├── jsconfig.json                 # Path alias (@/*)
    ├── .env.example                  # Example frontend environment variables
    ├── lib/
    │   ├── api.js                    # fetch wrapper (attaches JWT, base URL)
    │   └── auth-context.jsx          # Auth state (token, user, loading)
    ├── components/                   # Reusable UI components
    │   ├── Logo.jsx                  # Brand mark
    │   ├── AuthShell.jsx             # Split-layout wrapper for auth pages
    │   ├── Alert.jsx                 # Inline alert/notice
    │   ├── CreateLinkForm.jsx        # New-link form (alias, expiry)
    │   ├── LinkRow.jsx               # Link row (copy, analytics, delete)
    │   └── AnalyticsModal.jsx        # Per-link analytics + QR modal
    └── app/                          # App Router pages
        ├── layout.jsx               # Root layout (fonts, AuthProvider)
        ├── globals.css              # Tailwind base + component classes
        ├── page.jsx                 # Marketing landing page
        ├── login/page.jsx           # Login
        ├── signup/page.jsx          # Signup
        ├── verify/page.jsx          # OTP verification
        ├── forgot-password/page.jsx # Request password reset
        ├── reset-password/page.jsx  # Set new password via token
        └── dashboard/              # Protected dashboard
            ├── layout.jsx          # Sidebar + auth guard
            └── page.jsx            # Stats, create & manage links
```

---

## API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create an account, emails a 6-digit OTP | Public |
| POST | `/api/auth/verify-otp` | Verify the OTP, returns a JWT | Public |
| POST | `/api/auth/resend-otp` | Resend a verification code | Public |
| POST | `/api/auth/login` | Log in, returns a JWT (verified accounts only) | Public |
| POST | `/api/auth/forgot-password` | Email a password-reset link | Public |
| POST | `/api/auth/reset-password` | Set a new password using a token | Public |
| GET | `/api/auth/me` | Get the current authenticated user | Required |
| POST | `/api/links` | Create a short link | Required |
| GET | `/api/links` | List your links (with click counts) | Required |
| GET | `/api/links/:id/qr` | Get a QR code (data URL) for a link | Required |
| GET | `/api/links/:id/analytics` | Detailed analytics for a link | Required |
| DELETE | `/api/links/:id` | Delete a link | Required |
| GET | `/:code` | Redirect to the destination URL | Public |
| GET | `/health` | Health check (`{ status: "ok" }`) | Public |

### Create a link

```bash
curl -X POST http://localhost:4000/api/links \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"destination":"https://example.com","alias":"promo","expiresAt":null}'
```

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `destination` | string (URL) | Yes | Max 2048 chars |
| `alias` | string | No | 3–32 alphanumeric chars; must be unique |
| `expiresAt` | ISO datetime / null | No | Link stops resolving after this time |

**Response (`201`)**

```json
{
  "id": 1,
  "shortCode": "promo",
  "shortUrl": "http://localhost:4000/promo",
  "destination": "https://example.com",
  "isCustom": true,
  "expiresAt": null,
  "createdAt": "2026-06-18T10:00:00.000Z",
  "clickCount": 0
}
```

---

## How Redirects Stay Fast

1. `GET /:code` first reads `link:<code>` from **Redis**.
2. On a **cache hit**, it redirects immediately using the cached destination.
3. On a **cache miss**, it queries **PostgreSQL**, checks expiry, then writes the result back to Redis with a TTL (`CACHE_TTL_SECONDS`, default 1h).
4. **Click logging runs asynchronously**, so capturing referrer/browser/OS/device never delays the redirect itself.

---

## Contributing

Contributions are welcome! Follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Commit** your changes: `git commit -m "feat: add your feature"`
4. **Push** to your branch: `git push origin feature/your-feature-name`
5. **Open a Pull Request** targeting the `main` branch

Please follow the existing code style and include clear commit messages.

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">Built with PostgreSQL · Express · Next.js / React · Node.js · Redis</p>
