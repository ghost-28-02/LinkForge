# LinkForge

A production-style URL shortening service demonstrating full-stack engineering across authentication, data modeling, caching, and analytics.

A React + Tailwind frontend gives each user a personal dashboard to create and manage links. A Node/Express API handles JWT auth (bcrypt-hashed passwords), Base62 short-code generation, optional custom aliases, and link expiry. When someone visits a short link, the server checks Redis for the cached destination and only falls back to PostgreSQL on a cache miss — keeping redirects fast while logging each click (timestamp, referrer, browser, OS, device) for analytics. Rate limiting protects the shorten and auth endpoints from abuse.

## Tech stack

React (Vite) + Tailwind CSS · Node.js + Express · PostgreSQL · Redis · JWT auth · QR code generation

## Features

- User accounts (register / login) with JWT + bcrypt
- Create short links with optional custom aliases and expiry dates
- Redis read-through cache for fast redirects, PostgreSQL as source of truth
- Per-click logging: timestamp, referrer, browser, OS, device
- Analytics dashboard with device / browser / OS breakdown and a click timeline
- On-demand QR code generation for any link
- Rate limiting on the shorten and auth endpoints

## Project structure

```
LinkForge/
├── server/                 # Node.js + Express API
│   └── src/
│       ├── config/         # env, db (pg pool), redis client
│       ├── db/             # schema.sql + migration runner
│       ├── middleware/     # auth, rate limiting, error handling
│       ├── controllers/    # auth, links, redirect, analytics
│       ├── routes/         # /api/auth, /api/links
│       └── utils/          # base62, user-agent parsing
└── client/                 # React (Vite) + Tailwind dashboard
    └── src/
        ├── api/            # fetch wrapper
        ├── context/        # AuthContext
        ├── components/     # Navbar, LinkCard, CreateLinkForm, ...
        └── pages/          # Login, Register, Dashboard, Analytics
```

## Getting started

You need PostgreSQL and Redis running locally. Then start the backend and frontend in separate terminals.

- Frontend: http://localhost:5173
- API: http://localhost:4000
- Short links resolve at `http://localhost:4000/<code>`

**Backend**

```bash
cd server
cp .env.example .env          # point DATABASE_URL / REDIS_URL at your services
npm install
npm run migrate               # apply the schema
npm run dev                   # starts on :4000
```

**Frontend**

```bash
cd client
cp .env.example .env          # VITE_API_URL=http://localhost:4000
npm install
npm run dev                   # starts on :5173
```

## API reference

| Method | Endpoint                     | Auth | Description                          |
| ------ | ---------------------------- | ---- | ------------------------------------ |
| POST   | `/api/auth/register`         | —    | Create an account, returns a token   |
| POST   | `/api/auth/login`            | —    | Log in, returns a token              |
| GET    | `/api/auth/me`               | ✓    | Current user                         |
| POST   | `/api/links`                 | ✓    | Create a short link                  |
| GET    | `/api/links`                 | ✓    | List your links (with click counts)  |
| GET    | `/api/links/:id/qr`          | ✓    | QR code (data URL) for a link        |
| GET    | `/api/links/:id/analytics`   | ✓    | Detailed analytics for a link        |
| DELETE | `/api/links/:id`             | ✓    | Delete a link                        |
| GET    | `/:code`                     | —    | Redirect to the destination          |

### Create a link

```bash
curl -X POST http://localhost:4000/api/links \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"destination":"https://example.com","alias":"promo","expiresAt":null}'
```

## How redirects stay fast

1. `GET /:code` first reads `link:<code>` from Redis.
2. On a hit, it redirects immediately using the cached destination.
3. On a miss, it queries PostgreSQL, checks expiry, then writes the result back to Redis with a TTL (`CACHE_TTL_SECONDS`, default 1h).
4. Click logging runs asynchronously so it never delays the redirect.

## Environment variables

See `.env.example` (root) and `server/.env.example` / `client/.env.example`. Set a strong `JWT_SECRET` before deploying.
