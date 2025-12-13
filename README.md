# Atelier — Fine Jewellery

Modern, minimal Next.js + TypeScript + Tailwind CSS website for a premium jewellery brand.

## Quick Start

```powershell
npm install
cp .env.example .env.local  # Then add your Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 14** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS v4** — Styling
- **Supabase** — Backend database
- **Framer Motion** — Animations
- **Playfair Display + Inter + Cormorant Garamond** — Typography

## Features

### Public Site
- ✨ Pandora-inspired clean, light design
- 🎨 Luxury typography (Cormorant Garamond + Poppins)
- 📱 Fully responsive with mobile menu
- ⚡ Next.js 16 with Turbopack for fast development
- 🖼️ Product listing and detail pages with galleries
- 🔍 SEO optimized (Open Graph, JSON-LD, Canonical)

### Admin Panel
- 🔐 Secure JWT authentication with bcrypt
- 💎 Product management (CRUD, stock control, hide/show)
- 📦 Order management
- 🏷️ Category management
- 🏠 **Dynamic homepage content manager**
# Atelier — Fine Jewellery

Modern, minimal Next.js + TypeScript + Tailwind CSS website for a premium jewellery brand.

## Quick Start

```powershell
npm install
cp .env.example .env.local  # Then add your Supabase credentials
npm run dev
```

Open `http://localhost:3000`

## Purpose of this README update

This README is extended to include a concise reference of the main API routes, database schemas, and the core logic files so developers can quickly understand how the app is structured and where to look for functionality.

**Sections:**
- Project Overview
- Routes (public + admin)
- Database Schema (SQL files & main tables)
- Core Logic (key libs, hooks, contexts)
- Environment & Local Setup
- Useful Commands

## Project Overview

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: Supabase (Postgres + Storage). API routes in `pages/api/*` act as server-side logic and thin wrappers around Supabase.
- Admin: Protected endpoints under `pages/api/admin/*` backed by JWT tokens and a service role client for write operations.

## Routes (summary)

The API routes are implemented as Next.js API routes under `pages/api`. Below are the main public and admin endpoints and the files that implement them.

- Public API routes (`pages/api`)
	- `GET /api/products` -> `pages/api/products/index.ts` : list products (filters via query string)
	- `GET /api/products/[id]` -> `pages/api/products/[id].ts` : get single product
	- `GET /api/categories` -> `pages/api/categories.ts` : list categories
	- `POST /api/orders` -> `pages/api/orders/index.ts` : create an order
	- `GET /api/orders` -> `pages/api/orders/index.ts` : list orders (authenticated users)
	- `GET /api/orders/[id]` -> `pages/api/orders/[id].ts` : get order by id
	- `GET|POST|DELETE /api/favorites` -> `pages/api/favorites/index.ts` : manage client favorites

- User Auth API routes (`pages/api/auth/*`) — OTP-based authentication
	- `POST /api/auth/generate-otp` -> `pages/api/auth/generate-otp.ts` : send OTP to email
	- `POST /api/auth/verify-otp` -> `pages/api/auth/verify-otp.ts` : verify OTP and set JWT cookie
	- `POST /api/auth/logout` -> `pages/api/auth/logout.ts` : clear auth cookie
	- `GET /api/auth/me` -> `pages/api/auth/me.ts` : get current user from JWT cookie

- Cart API routes (`pages/api/cart/*`) — require user auth (JWT cookie)
	- `GET /api/cart` -> `pages/api/cart/index.ts` : list cart items
	- `POST /api/cart` -> `pages/api/cart/index.ts` : add item to cart
	- `DELETE /api/cart` -> `pages/api/cart/index.ts` : clear entire cart
	- `PUT /api/cart/[id]` -> `pages/api/cart/[id].ts` : update cart item quantity
	- `DELETE /api/cart/[id]` -> `pages/api/cart/[id].ts` : remove item from cart

- Admin API routes (`pages/api/admin/*`) — require admin JWT in `Authorization: Bearer <token>`
	- `POST /api/admin/login` -> `pages/api/admin/login.ts` : credential login (returns token)
	- `POST /api/admin/generate-otp` -> `pages/api/admin/generate-otp.ts` : generate OTP for admin
	- `POST /api/admin/login-otp` -> `pages/api/admin/login-otp.ts` : login with OTP
	- `GET /api/admin/verify` -> `pages/api/admin/verify.ts` : verify admin token
	- `POST /api/admin/upload` -> `pages/api/admin/upload.ts` : upload images to Supabase Storage (requires service role)
	- `GET/POST/PUT/DELETE /api/admin/products` -> `pages/api/admin/products/index.ts` and `pages/api/admin/products/[id].ts` : product CRUD
	- `GET /api/admin/dashboard` -> `pages/api/admin/dashboard.ts` : admin dashboard data
	- `GET/POST/PUT/DELETE` for `hero-images`, `homepage-sections`, `featured-collections`, `testimonials`, `settings`, and `orders` under `pages/api/admin/*` (see files in that folder)

Note: The admin client wrapper `hooks/useAdminApi.ts` expects to call endpoints with a `/api/admin` prefix (it adds `Authorization` header automatically when token present).

## Database Schema

SQL definition files are in `lib/` and are the source of truth to run in the Supabase SQL editor.

- `lib/supabase-schema.sql` — core application tables
	- `products` — product catalog (id, name, description, price, old_price, category, gender, image_url, images[], stock, is_hidden, created_at)
	- `categories` — (optional) structured categories
	- `orders` — order storage (user_name, phone, address, items JSONB, total_price, payment_method, payment_status, status)
	- `favorites` — favorite items per `client_token`
	- `admin_users`, `store_settings` — admin user and settings tables
	- RLS policies for public reads and service-role writes are defined here

- `lib/supabase-dynamic-content-schema.sql` — homepage/dynamic content
	- `hero_images`, `featured_collections`, `testimonials`, `homepage_sections`, `product_images`
	- Indexes, RLS policies, sample data, and helper triggers for `updated_at` are included

- `lib/supabase-admin-schema.sql` — admin-specific additions (duplicate/extension of admin tables and settings)

- `lib/supabase-user-auth-schema.sql` — user authentication tables
	- `users` — user accounts (email-based login)
	- `user_otps` — OTP codes for email verification
	- `user_cart` — shopping cart per user
	- `user_favorites` — favorites per authenticated user
	- Adds `user_id` column to `orders` table

Recommended order to apply SQL (via Supabase SQL editor):
1. `lib/supabase-schema.sql`
2. `lib/supabase-admin-schema.sql` (optional)
3. `lib/supabase-dynamic-content-schema.sql` (dynamic content / storage)
4. `lib/supabase-user-auth-schema.sql` (user authentication)

Also create Storage buckets (via Supabase UI): `product-images`, `hero-images`, `collection-images` (public as described in `DYNAMIC_CONTENT_SETUP.md`).

## Core logic (key files)

- `lib/supabase.ts` — exports a client (`supabase`) using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Also contains TypeScript interfaces for `Product`, `Order`, `Favorite`, etc.
- `lib/admin-auth.ts` — admin credential verification, bcrypt password hashing, JWT creation and verification. Exposes `verifyAdminCredentials`, `generateAdminToken`, and `verifyAdminToken`.
- `lib/admin-api-utils.ts` — helpers for admin API routes: creates a service-role Supabase client (when `SUPABASE_SERVICE_ROLE_KEY` is provided), extracts admin token from requests, and chooses admin vs anon client.
- `lib/admin-otp.ts` — simple in-memory OTP generator/validator used by admin OTP endpoints (dev-friendly behavior when `ADMIN_NO_AUTH` set).
- `lib/user-auth.ts` — user JWT generation/verification, OTP helpers, cookie management. Separate from admin auth.
- `lib/user-auth-middleware.ts` — `withUserAuth` middleware to protect user-only API routes.
- `lib/email.ts` — Nodemailer setup for sending OTP emails (falls back to console logging in dev).

- `hooks/useProducts.ts` — client hook to fetch `/api/products` and single product endpoints
- `hooks/useAdminApi.ts` — thin wrapper that injects admin `Authorization` header and exposes `get/post/put/del` helpers targeting `/api/admin/*` endpoints

- `context/AdminAuthContext.tsx` — React context and provider for admin session management; stores token in cookie and admin user in localStorage. Helpers: `login`, `generateOtp`, `loginWithOtp`, `logout`.
- `context/UserAuthContext.tsx` — React context for user authentication; uses HTTP-only cookie. Helpers: `generateOtp`, `verifyOtp`, `logout`, `refreshUser`.
- `context/CartContext.tsx`, `context/FavoritesContext.tsx` — client-side contexts for cart and favorite tokens (see files for usage)

- `components/LoginForm.tsx` — reusable login form with email → OTP → verify flow

## Env vars

Minimum required for local development (place in `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (required for admin write operations like uploads; keep secure)
- `JWT_SECRET` — secret used to sign admin JWTs (development default exists but change it for real deployments)
- `USER_JWT_SECRET` — secret used to sign user JWTs (separate from admin for security)
- `ADMIN_NO_AUTH` — if set to `true` (server-side), admin auth is bypassed for testing (dangerous in production)
- `NEXT_PUBLIC_ADMIN_UNLOCK` — client-side dev unlock for Admin UI (local only)

### Email/SMTP Configuration (for user OTP)

- `SMTP_HOST` — SMTP server hostname (default: `smtp.gmail.com`)
- `SMTP_PORT` — SMTP port (default: `587`)
- `SMTP_SECURE` — set to `true` for port 465
- `SMTP_USER` — SMTP username/email
- `SMTP_PASS` — SMTP password or app-specific password
- `SMTP_FROM` — sender address (e.g., `"Atelier" <noreply@atelier.com>`)

> **Note:** If SMTP is not configured, OTPs are logged to the server console for development.

## Local Setup & Run

1. Install dependencies:

```powershell
npm install
```

2. Copy env example and set keys:

```powershell
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# (and SUPABASE_SERVICE_ROLE_KEY if you will use admin write features)
```

3. Initialize your Supabase schema via SQL editor (run the files under `lib/`):

```powershell
# Run in Supabase SQL editor in this order:
# 1. lib/supabase-schema.sql
# 2. lib/supabase-admin-schema.sql (optional)
# 3. lib/supabase-dynamic-content-schema.sql
```

4. Start dev server:

```powershell
npm run dev
```

## Useful Commands

- `npm run dev` — start Next dev server
- `npm run build` — production build
- `npm run start` — start production server after build

## Where to look / next steps for contributors

- API route implementations: `pages/api/*` and `pages/api/admin/*`
- Database DDL: `lib/*.sql`
- Admin auth flow: `lib/admin-auth.ts`, `lib/admin-otp.ts`, `lib/admin-api-utils.ts`, and the admin API routes
- Client helpers: `hooks/useProducts.ts`, `hooks/useAdminApi.ts`, and contexts in `context/`

If you'd like, I can also generate a markdown table of every single API file with a one-line description extracted directly from each file's implementation (more verbose). Want me to do that next?
