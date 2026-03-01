# Atelier — Full Architecture & Integration Analysis

> Generated: March 2026 | Stack: Next.js 16.0.7 (Pages Router) · React 18.2 · Supabase · Tailwind CSS v4

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Data Flow Diagrams](#2-data-flow-diagrams)
3. [Core Infrastructure Layer](#3-core-infrastructure-layer)
4. [Authentication & Security](#4-authentication--security)
5. [Caching Architecture](#5-caching-architecture)
6. [Frontend Pages & Routing](#6-frontend-pages--routing)
7. [Admin Panel](#7-admin-panel)
8. [API Layer](#8-api-layer)
9. [Component Architecture](#9-component-architecture)
10. [Context Providers](#10-context-providers)
11. [Hooks](#11-hooks)
12. [Database Schema](#12-database-schema)
13. [File-by-File Reference](#13-file-by-file-reference)

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ Public Pages  │  │ Admin Panel  │  │ Shared Contexts    │    │
│  │ (SSG + ISR)   │  │ (CSR / SPA)  │  │ Cart, Auth, Favs   │    │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘    │
└─────────┼─────────────────┼───────────────────┼────────────────┘
          │                 │                   │
   ┌──────▼─────────────────▼───────────────────▼──────┐
   │              Next.js API Routes                    │
   │  ┌────────────┐ ┌──────────────┐ ┌──────────────┐ │
   │  │ Public API  │ │ Admin API    │ │ Auth API     │ │
   │  │ /api/...    │ │ /api/admin/  │ │ /api/auth/   │ │
   │  └──────┬─────┘ └──────┬───────┘ └──────┬───────┘ │
   │         │       ┌──────┘                 │         │
   │  ┌──────▼───────▼───────────────────────▼──────┐  │
   │  │         Server-Side Cache Layer              │  │
   │  │  L1: In-memory TTL  │  L2: Request Dedup    │  │
   │  │  L3: Stale-While-Revalidate                 │  │
   │  └──────────────┬──────────────────────────────┘  │
   └─────────────────┼─────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │     SUPABASE        │
          │  ┌──────────────┐   │
          │  │  PostgreSQL   │   │
          │  │  (Tables+RLS) │   │
          │  ├──────────────┤   │
          │  │  Storage      │   │
          │  │  (Buckets)    │   │
          │  └──────────────┘   │
          └─────────────────────┘
```

### Key Principles

- **Public pages** are statically generated (SSG) with Incremental Static Regeneration (ISR, 60s–3600s revalidation)
- **Admin pages** are client-side rendered (CSR) behind JWT authentication
- **All admin writes** go through service-role Supabase client (bypasses RLS)
- **All public reads** use anon client + server-side cache
- **Cache invalidation** is triggered from admin API mutation handlers

---

## 2. Data Flow Diagrams

### Homepage Rendering Flow

```
getStaticProps (ISR, revalidate: 60s)
    │
    ├── getCachedSiteConfig()      → site_config table → homepage_layout[]
    ├── getCachedHeroImages()      → hero_images table
    ├── getCachedFeaturedCollections() → featured_collections table
    ├── getCachedNewArrivals()     → products table (latest 6)
    ├── getCachedTestimonials()    → testimonials table
    ├── getCachedAnnouncements()   → announcements table
    └── getCachedHomepageSections() → homepage_sections table
    │
    ▼
renderSection(key) switch:
    'hero'                → <Hero>
    'limited_drop'        → <LimitedDrop>
    'announcement_banner' → <AnnouncementBanner>
    'value_proposition'   → <ValueProposition>
    'featured_collections'→ <FeaturedCollections>
    'logo_marquee'        → <LogoMarquee>
    'collections_highlight'→<CollectionsHighlight>
    'process_steps'       → <ProcessSteps>
    'trending_now'        → <TrendingNow>
    'craftsmanship'       → <Craftsmanship>
    'brand_story'         → <BrandStory>
    'new_arrivals'        → ProductCard grid
    'testimonials'        → <Testimonials>
    'instagram_gallery'   → <InstagramGallery>
    'newsletter'          → <Newsletter>
```

### Admin Mutation Flow

```
Admin UI (e.g. homepage.tsx)
    │
    ├── useAdminApi().put('/homepage-sections', data)
    │       │
    │       ▼
    │   Authorization: Bearer <JWT>
    │       │
    │       ▼
    │   /api/admin/homepage-sections.ts
    │       │
    │       ├── verifyAdminToken(jwt) → AdminUser | null
    │       ├── supabaseAdmin.from('homepage_sections').upsert(...)
    │       ├── apiCache.invalidateByTag('homepage_sections')
    │       ├── invalidateSSGCache('homepage_sections')
    │       └── res.revalidate('/')  ← triggers ISR rebuild
    │
    ▼
Next request to / → fresh data from Supabase
```

### Order Creation Flow

```
Checkout Page (checkout.tsx)
    │
    ├── CartContext.items + form data
    │       │
    │       ▼
    │   POST /api/orders
    │       │
    │       ├── getUserFromRequest(req)           ← JWT cookie auth
    │       ├── Validate: name, phone, address, items
    │       ├── Check stock availability per item
    │       ├── Decrement stock (supabaseAdmin)
    │       ├── Insert order row
    │       ├── Clear user's cart
    │       └── Send confirmation email
    │
    ▼
    order-confirmation.tsx (redirect with order ID)
```

---

## 3. Core Infrastructure Layer

### `lib/supabase.ts` (128 lines)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Supabase anon client + all TypeScript type definitions |
| **Exports** | `supabase` (anon client), `Product`, `Category`, `Order`, `OrderItem`, `PaymentProof`, `OrderStatusHistory`, `Favorite`, `ProductReview`, `ProductReviewStats`, `Coupon` |
| **Used by** | Every file that reads from Supabase on public routes, type definitions used across the entire codebase |
| **Client type** | Anon key — subject to RLS policies |
| **Note** | Service-role clients are created separately in each API file or via `lib/admin-api-utils.ts` |

### `lib/admin-api-utils.ts` (54 lines)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Centralized admin Supabase client factory |
| **Exports** | `getSupabaseAdmin()`, `getSupabaseClient()`, `getAdminFromRequest()`, `isServiceRoleConfigured()` |
| **Pattern** | Singleton — creates `supabaseAdmin` once, reuses across requests |
| **Used by** | `pages/api/orders/index.ts` and some newer API routes |
| **Note** | Older admin API files create their own `supabaseAdmin` inline; this utility exists to reduce duplication |

### `lib/siteConfig.ts` (65 lines)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Global site configuration singleton with in-memory caching |
| **Exports** | `getSiteConfig()`, `clearSiteConfigCache()`, `SiteConfig`, `ThemeColors`, `NavMenuItem` |
| **Cache** | 5-minute TTL with in-flight deduplication |
| **Used by** | `SiteConfigContext`, `pages/index.tsx`, any component needing theme/nav/features config |
| **Data shape** | `{ theme_colors, typography, features, homepage_layout, nav_menu }` |

### `lib/validation.ts` (47 lines)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Pure utility functions for input sanitization |
| **Exports** | `sanitizeEmail()`, `isValidEmail()`, `sanitizeString()`, `isValidUUID()`, `sanitizeHtml()`, `validatePositiveNumber()`, `validateInteger()`, `escapeSqlString()` |
| **Used by** | API routes for input validation before database operations |

### `lib/rate-limit.ts` (62 lines)

| Aspect | Detail |
|--------|--------|
| **Purpose** | In-memory sliding-window rate limiter for API routes |
| **Exports** | `rateLimit(options)` factory → `{ check(identifier) }`, `getClientIp(req)` |
| **Used by** | Auth endpoints (`generate-otp`, `verify-otp`) to prevent brute-force |
| **Limitation** | In-memory only — resets on server restart, doesn't work across serverless instances |

### `lib/email.ts` (348 lines)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Transactional email via nodemailer SMTP |
| **Exports** | `sendOtpEmail()`, `sendOrderConfirmationEmail()`, `sendDeliveryNotificationEmail()` |
| **Config** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` env vars |
| **Fallback** | In dev without SMTP credentials, logs to console instead |
| **Used by** | `pages/api/auth/generate-otp.ts`, `pages/api/orders/index.ts`, `pages/api/admin/orders/[id].ts` |

### `next.config.js` (110 lines)

| Aspect | Detail |
|--------|--------|
| **Compression** | gzip enabled |
| **Images** | AVIF/WebP, 30-day cache, remote patterns for Unsplash/Pexels/Supabase |
| **Headers** | HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff |
| **Console** | Stripped in production (error/warn kept) |
| **Static assets** | Immutable cache headers on `/_next/static/` |

### `package.json`

| Dependency | Version | Purpose |
|------------|---------|---------|
| next | 16.0.7 | Framework |
| react | 18.2 | UI library |
| @supabase/supabase-js | 2.86 | Database + storage client |
| tailwindcss | 4.1.17 | Utility CSS |
| jsonwebtoken | 9.x | JWT auth tokens |
| bcryptjs | 3.x | Password hashing |
| nodemailer | 7.x | Email sending |
| @dnd-kit/* | latest | Drag-and-drop (admin builder) |
| cmdk | latest | Command palette |
| formidable | latest | File upload parsing |

---

## 4. Authentication & Security

### Admin Auth System

```
Login Flow:
  1. POST /api/admin/generate-otp  { username }
       → Checks admin_users table (supabaseAdmin)
       → Generates 6-digit OTP (lib/admin-otp.ts)
       → In production: send via email (TODO)
       → In dev: returns code in response

  2. POST /api/admin/login-otp  { username, otp }
       → verifyOtpForUser() — single-use, 5-min expiry
       → Fetches admin user from DB (supabaseAdmin)
       → generateAdminToken() → JWT (8h expiry)
       → Returns { token, admin }

  3. Client stores token in cookie (js-cookie, 1-day expiry)
       → AdminAuthContext reads cookie on mount
       → useAdminApi() attaches Bearer token to all requests

  4. Every admin API: verifyAdminToken(jwt) → AdminUser | null
       → 401 if invalid/expired
```

**Files involved:**
| File | Role |
|------|------|
| `lib/admin-auth.ts` | JWT sign/verify, password hash verify |
| `lib/admin-otp.ts` | OTP generation, verification, expiry (in-memory Map) |
| `context/AdminAuthContext.tsx` | React context, cookie management, login/logout |
| `hooks/useAdminApi.ts` | Authenticated fetch wrapper (GET/POST/PUT/DELETE) |
| `pages/api/admin/generate-otp.ts` | OTP request endpoint |
| `pages/api/admin/login-otp.ts` | OTP verification + token issuance |
| `pages/api/admin/login.ts` | Legacy password-based login (fallback) |
| `pages/api/admin/verify.ts` | Token validity check |

**Security measures:**
- JWT_SECRET required in production (throws on startup if missing)
- OTP never returned in response body in production
- `_debugListOtps()` returns empty array in production
- Rate limiting on OTP endpoints
- All admin writes use `supabaseAdmin` (service-role, bypasses RLS)

### User Auth System

```
Login Flow:
  1. POST /api/auth/generate-otp  { email }
       → Creates/finds user in users table
       → Generates 6-digit OTP (10-min expiry)
       → Sends via email (sendOtpEmail)

  2. POST /api/auth/verify-otp  { email, otp }
       → Validates OTP against DB
       → generateUserToken() → JWT (7-day expiry)
       → Sets HTTP-only cookie (atelier_user_token)

  3. Client detects auth via /api/auth/me
       → UserAuthContext caches in sessionStorage (10-min TTL)
       → Provides { user, isAuthenticated, logout }
```

**Files involved:**
| File | Role |
|------|------|
| `lib/user-auth.ts` | JWT sign/verify, cookie set/clear, OTP generation |
| `lib/user-auth-middleware.ts` | `withUserAuth()` / `withOptionalUserAuth()` HOFs |
| `context/UserAuthContext.tsx` | React context, session caching, OTP methods |
| `pages/api/auth/generate-otp.ts` | Email OTP request |
| `pages/api/auth/verify-otp.ts` | OTP verification + cookie set |
| `pages/api/auth/me.ts` | Current user from cookie |
| `pages/api/auth/profile.ts` | Update user profile |
| `pages/api/auth/logout.ts` | Clear cookie |
| `pages/api/auth/delete.ts` | Account deletion |

---

## 5. Caching Architecture

### Four-Layer Cache System

```
Layer 1: In-Memory TTL Cache (ServerCache)
  ├── apiCache: 300 entries, API route results
  └── ssgCache: 100 entries, getStaticProps data

Layer 2: Request Deduplication
  └── Concurrent requests for same key share one Promise

Layer 3: Stale-While-Revalidate
  └── Serve stale data while background fetch runs
  └── staleTTL: 120s (SSG), configurable (API)

Layer 4: ISR Page Cache (Next.js)
  └── Homepage: 60s revalidation
  └── Products: 3600s revalidation
  └── On-demand: res.revalidate() from admin APIs
```

### `lib/server-cache.ts` (246 lines)

| Export | Purpose |
|--------|---------|
| `ServerCache` class | Generic TTL cache with LRU eviction, tag-based invalidation |
| `apiCache` | 300-entry instance for API route caching |
| `ssgCache` | 100-entry instance for SSG data caching |
| `makeCacheKey()` | Deterministic key from query params |
| Methods | `getOrFetch()`, `invalidateByTag()`, `clear()`, `getStats()` |

### `lib/cache.ts` (184 lines)

| Export | Purpose |
|--------|---------|
| `getCachedSiteConfig()` | Cached site configuration |
| `getCachedHeroImages()` | Cached active hero slides |
| `getCachedFeaturedCollections()` | Cached active collections |
| `getCachedNewArrivals()` | Cached latest 6 products |
| `getCachedFeaturedProducts()` | Cached featured products (up to 10) |
| `getCachedTestimonials()` | Cached active testimonials |
| `getCachedCollectionsHighlight()` | Derived from collections cache |
| `getCachedAnnouncements()` | Cached active announcements |
| `getCachedHomepageSections()` | Cached active homepage sections |
| `invalidateSSGCache(tag?)` | Invalidates ssgCache by tag or all |

### Cache Invalidation Map

Every admin mutation triggers these invalidations:

| Admin API | Cache Tags Invalidated | ISR Pages Revalidated |
|-----------|----------------------|----------------------|
| `homepage-sections` | `homepage_sections` | `/` |
| `featured-collections` | `featured_collections` | `/` |
| `hero-images` | `hero_images` | `/` |
| `hero-overlay` | `hero_images` | `/` |
| `testimonials` | `testimonials` | `/` |
| `announcements` | `announcements` | `/` |
| `products/*` | `products` | `/`, `/products` |
| `categories/*` | `categories` | `/` |
| `reviews/*` | `reviews` | — |
| `orders/*` | `orders`, `products` | — |
| `settings` | `store_settings`, `site_config` | `/` |
| `site-config` | `site_config` | `/` |

---

## 6. Frontend Pages & Routing

### Public Pages

| Route | File | Lines | Rendering | Purpose |
|-------|------|-------|-----------|---------|
| `/` | `pages/index.tsx` | 428 | SSG + ISR (60s) | Homepage with dynamic section ordering |
| `/products` | `pages/products/index.tsx` | 469 | SSG + ISR (3600s) | Product listing with filters |
| `/products/[id]` | `pages/products/[id].tsx` | 567 | SSG + ISR (3600s) | Product detail with reviews |
| `/cart` | `pages/cart.tsx` | — | CSR | Shopping cart |
| `/checkout` | `pages/checkout.tsx` | 782 | CSR | Checkout with payment |
| `/order-confirmation` | `pages/order-confirmation.tsx` | — | CSR | Order success page |
| `/orders/[id]` | `pages/orders/[id].tsx` | — | CSR | Order tracking |
| `/account` | `pages/account.tsx` | 587 | CSR | User profile + order history |
| `/login` | `pages/login.tsx` | — | CSR | OTP login |
| `/favorites` | `pages/favorites.tsx` | — | CSR | Saved products |
| `/about` | `pages/about.tsx` | — | Static | About page |
| `/faq` | `pages/faq.tsx` | — | Static | FAQ |
| `/journal` | `pages/journal.tsx` | — | Static | Blog/journal |
| `/gift-guide` | `pages/gift-guide.tsx` | — | Static | Gift guide |
| `/shipping-info` | `pages/shipping-info.tsx` | — | Static | Shipping info |
| `/returns` | `pages/returns.tsx` | — | Static | Returns policy |
| `/privacy-policy` | `pages/privacy-policy.tsx` | — | Static | Privacy policy |
| `/terms-of-service` | `pages/terms-of-service.tsx` | — | Static | Terms |
| `/cookie-policy` | `pages/cookie-policy.tsx` | — | Static | Cookie policy |

### Admin Pages

| Route | File | Lines | Purpose |
|-------|------|-------|---------|
| `/admin/dashboard` | `pages/admin/dashboard.tsx` | 304 | Stats overview |
| `/admin/products` | `pages/admin/products.tsx` | 883 | Product CRUD |
| `/admin/orders` | `pages/admin/orders.tsx` | 685 | Order management |
| `/admin/categories` | `pages/admin/categories.tsx` | 311 | Category management |
| `/admin/homepage` | `pages/admin/homepage.tsx` | 1736 | Homepage content editor |
| `/admin/builder` | `pages/admin/builder.tsx` | 465 | Visual layout builder |
| `/admin/settings` | `pages/admin/settings.tsx` | 345 | Store settings |
| `/admin/reviews` | `pages/admin/reviews.tsx` | 514 | Review moderation |

---

## 7. Admin Panel

### Architecture

All admin pages follow the same structure:

```tsx
export default function AdminXxxPage() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <AdminLayout title="..." subtitle="...">
          <Head><title>... | Atelier Admin</title></Head>
          <XxxContent />
        </AdminLayout>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
```

- `AdminAuthProvider` handles JWT authentication and redirects to login page
- `ToastProvider` provides toast notification methods
- `AdminLayout` renders sidebar navigation + command palette (⌘K)
- Inner `XxxContent` component contains the actual CRUD logic

### Admin API Pattern

Every admin API file follows this pattern:

```typescript
// 1. Create supabaseAdmin from service role key
const supabaseAdmin = createClient(url, serviceRoleKey)

// 2. Auth check
const admin = getAdminFromRequest(req)
if (!admin) return res.status(401)

// 3. Use supabaseAdmin for writes (bypasses RLS)
const { data, error } = await supabaseAdmin.from('table').upsert(...)

// 4. Invalidate caches after mutations
apiCache.invalidateByTag('tag')
invalidateSSGCache('tag')
await res.revalidate('/')
```

### `components/admin/AdminLayout.tsx` (372 lines)

| Aspect | Detail |
|--------|--------|
| **Sidebar nav** | Dashboard, Products, Orders, Categories, Homepage, Settings, Reviews, Layout |
| **Auth guard** | Redirects to `/admin` login if no valid token |
| **Command palette** | ⌘K / Ctrl+K opens search across products, orders, and pages |
| **Responsive** | Collapsible sidebar on mobile |

### `components/admin/AdminImageUpload.tsx` (210 lines)

| Aspect | Detail |
|--------|--------|
| **Upload method** | Signed URL from `/api/admin/upload-url` → XHR PUT to Supabase Storage |
| **Progress** | Real-time progress bar via XHR `upload.onprogress` |
| **Validation** | JPEG, PNG, WebP, AVIF; max 8 MB |
| **Folders** | `hero` → hero-images bucket, `collections` → collection-images, default → product-images |
| **Fallback** | Manual URL paste input |

### `components/admin/CommandPalette.tsx` (162 lines)

| Aspect | Detail |
|--------|--------|
| **Library** | `cmdk` |
| **Search** | Debounced (300ms), searches products (by name) and orders (by user_name) |
| **Navigation** | Quick links to Dashboard, Products, Orders, Builder |
| **Security** | Search input sanitized before PostgREST queries |

---

## 8. API Layer

### Public APIs

| Endpoint | Methods | Auth | Cache | Purpose |
|----------|---------|------|-------|---------|
| `/api/products` | GET | None | 5-min + CDN | Product listing with filters |
| `/api/products/[id]` | GET | None | 5-min + CDN | Single product |
| `/api/categories` | GET | None | — | Category list |
| `/api/orders` | GET, POST | User JWT | — | User's orders / create order |
| `/api/orders/[id]` | GET | User JWT | — | Single order detail |
| `/api/orders/cancel` | POST | User JWT | — | Cancel an order |
| `/api/cart` | GET, POST, DELETE | User JWT | — | Persistent cart |
| `/api/cart/[id]` | PUT, DELETE | User JWT | — | Update/remove cart item |
| `/api/favorites` | GET, POST, DELETE | Optional | — | Favorites (anon or auth) |
| `/api/reviews` | GET, POST | Optional | — | Product reviews |
| `/api/reviews/[id]` | GET | None | — | Single review |
| `/api/newsletter` | POST | None | — | Newsletter signup |
| `/api/coupons/validate` | POST | None | — | Coupon validation |
| `/api/store-settings` | GET | None | — | Public store settings |
| `/api/upload/payment-proof` | POST | User JWT | — | Payment screenshot upload |

### Admin APIs

| Endpoint | Methods | Auth | Cache Invalidation | Purpose |
|----------|---------|------|--------------------|---------|
| `/api/admin/generate-otp` | POST | None | — | Request admin OTP |
| `/api/admin/login-otp` | POST | None | — | Verify OTP, get token |
| `/api/admin/login` | POST | None | — | Password login (fallback) |
| `/api/admin/verify` | GET/POST | Admin JWT | — | Validate token |
| `/api/admin/dashboard` | GET | Admin JWT | — | Dashboard stats |
| `/api/admin/products` | GET, POST | Admin JWT | products → /, /products | Product CRUD |
| `/api/admin/products/[id]` | GET, PUT, DELETE | Admin JWT | products → /, /products | Single product |
| `/api/admin/orders` | GET | Admin JWT | — | Order list |
| `/api/admin/orders/[id]` | GET, PUT, DELETE | Admin JWT | orders, products | Order management |
| `/api/admin/orders/all` | DELETE | Admin JWT | orders, products → / | Bulk delete |
| `/api/admin/categories` | GET, POST | Admin JWT | categories → / | Category CRUD |
| `/api/admin/categories/[id]` | GET, PUT, DELETE | Admin JWT | categories → / | Single category |
| `/api/admin/homepage-sections` | GET, PUT | Admin JWT | homepage_sections → / | Section content |
| `/api/admin/hero-images` | GET, POST, PUT, DELETE | Admin JWT | hero_images → / | Hero slides |
| `/api/admin/hero-overlay` | GET, PUT | Admin JWT | hero_images → / | Hero overlay settings |
| `/api/admin/featured-collections` | GET, POST, PUT, DELETE | Admin JWT | featured_collections → / | Collections |
| `/api/admin/testimonials` | GET, POST, PUT, DELETE | Admin JWT | testimonials → / | Testimonials |
| `/api/admin/announcements` | GET, POST, PUT, DELETE | Admin JWT | announcements → / | Announcements |
| `/api/admin/reviews` | GET | Admin JWT | — | Review list |
| `/api/admin/reviews/[id]` | GET, PUT, DELETE | Admin JWT | reviews | Review moderation |
| `/api/admin/settings` | GET, PUT | Admin JWT | store_settings, site_config → / | Store settings |
| `/api/admin/site-config` | GET, PUT | Admin JWT | site_config → / | Layout/theme config |
| `/api/admin/upload-url` | POST | Admin JWT | — | Signed upload URL |
| `/api/admin/upload` | POST | Admin JWT | — | Legacy file upload |
| `/api/admin/revalidate` | POST | Admin JWT | (tag-based) | Manual cache bust |

### Auth APIs

| Endpoint | Methods | Auth | Purpose |
|----------|---------|------|---------|
| `/api/auth/generate-otp` | POST | None | Send OTP email |
| `/api/auth/verify-otp` | POST | None | Verify OTP, set cookie |
| `/api/auth/me` | GET | User cookie | Current user |
| `/api/auth/profile` | PUT | User cookie | Update profile |
| `/api/auth/logout` | POST | User cookie | Clear cookie |
| `/api/auth/delete` | DELETE | User cookie | Delete account |

---

## 9. Component Architecture

### Homepage Sections (Dynamic, Admin-Controlled)

| Component | File | Lines | Data Source | Admin Editor |
|-----------|------|-------|-------------|-------------|
| `Hero` | `components/Hero.tsx` | 282 | `hero_images` table | Homepage → Hero tab |
| `AnnouncementBanner` | `components/AnnouncementBanner.tsx` | — | `announcements` table | Homepage → Announcements tab |
| `ValueProposition` | `components/ValueProposition.tsx` | — | `homepage_sections` (metadata) | Homepage → Process Steps tab |
| `FeaturedCollections` | `components/FeaturedCollections.tsx` | — | `featured_collections` table | Homepage → Collections tab |
| `LogoMarquee` | `components/LogoMarquee.tsx` | — | Static | — |
| `CollectionsHighlight` | `components/CollectionsHighlight.tsx` | — | Derived from `featured_collections` | — |
| `ProcessSteps` | `components/ProcessSteps.tsx` | — | `homepage_sections` (metadata) | Homepage → Process Steps tab |
| `TrendingNow` | `components/TrendingNow.tsx` | — | `homepage_sections` + products | — |
| `Craftsmanship` | `components/Craftsmanship.tsx` | — | `homepage_sections` (metadata) | Homepage → Craftsmanship tab |
| `BrandStory` | `components/BrandStory.tsx` | — | `homepage_sections` (metadata) | Homepage → Brand Story tab |
| `LimitedDrop` | `components/LimitedDrop.tsx` | — | `homepage_sections` (metadata) | Homepage → Limited Drop tab |
| `Testimonials` | `components/Testimonials.tsx` | — | `testimonials` table | Homepage → Testimonials tab |
| `InstagramGallery` | `components/InstagramGallery.tsx` | — | Static | — |
| `Newsletter` | `components/Newsletter.tsx` | — | `homepage_sections` (metadata) | — |
| `ProductCard` | `components/ProductCard.tsx` | — | Products array prop | — |

### Shared UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `Header` | `components/Header.tsx` (301 lines) | Main navbar with search, cart badge, user menu |
| `Footer` | `components/Footer.tsx` | Site footer |
| `Toast` | `components/Toast.tsx` | Toast notification display |
| `Skeleton` | `components/ui/Skeleton.tsx` | Loading placeholder |
| `ProductCarousel` | `components/ProductCarousel.tsx` | Image carousel for product detail |
| `ProductAccordion` | `components/ProductAccordion.tsx` | Expandable product info sections |
| `ProductReviews` | `components/ProductReviews.tsx` | Review display + submission form |
| `OrderReviewForm` | `components/OrderReviewForm.tsx` | Post-order review prompt |
| `LoginForm` | `components/LoginForm.tsx` | OTP login form |

---

## 10. Context Providers

### Provider Hierarchy (`_app.tsx`)

```tsx
<SiteConfigProvider initialConfig={pageProps.siteConfig}>
  <UserAuthProvider>
    <CartProvider>
      <FavoritesProvider>
        {children}           ← Every page
      </FavoritesProvider>
    </CartProvider>
  </UserAuthProvider>
</SiteConfigProvider>
```

### Provider Details

| Context | File | Lines | State | Storage |
|---------|------|-------|-------|---------|
| `SiteConfigProvider` | `context/SiteConfigContext.tsx` | 73 | Theme colors, nav menu, features | SSG hydration + fetch |
| `UserAuthProvider` | `context/UserAuthContext.tsx` | 182 | User object, auth status | HTTP-only cookie + sessionStorage cache |
| `CartProvider` | `context/CartContext.tsx` | 229 | Cart items array | localStorage (`atelier_cart`) |
| `FavoritesProvider` | `context/FavoritesContext.tsx` | 250 | Favorite product IDs | API + sessionStorage cache |
| `ToastProvider` | `context/ToastContext.tsx` | 65 | Current toast message | In-memory |
| `AdminAuthProvider` | `context/AdminAuthContext.tsx` | 80 | Admin JWT token, auth status | Cookie (`atelier_admin_token`) |

### Cross-Context Dependencies

```
SiteConfigContext
    └── Header reads nav_menu, theme_colors
    └── CSS custom properties injected to :root

UserAuthContext
    └── CartProvider validates against user's DB cart
    └── FavoritesProvider syncs favorites for auth'd users
    └── Header shows user avatar/name
    └── checkout.tsx pre-fills form from user profile

CartContext
    └── Header shows cart badge count
    └── cart.tsx reads/modifies items
    └── checkout.tsx reads items for order creation

FavoritesContext
    └── Header shows favorites count
    └── ProductCard shows heart icon state
    └── favorites.tsx lists favorited products
```

---

## 11. Hooks

| Hook | File | Lines | Purpose |
|------|------|-------|---------|
| `useAdminApi()` | `hooks/useAdminApi.ts` | 80 | Authenticated fetch wrapper for admin endpoints |
| `useProducts(options?)` | `hooks/useProducts.ts` | 158 | Client-side product fetching with cache |
| `useProduct(id)` | `hooks/useProducts.ts` | — | Single product fetch with SWR |
| `useDirectUpload()` | `hooks/useDirectUpload.ts` | 209 | Multi-file upload to Supabase Storage |
| `useDebounce(value, delay)` | `hooks/useDebounce.ts` | — | Debounced value |
| `useIntersectionObserver()` | `hooks/useIntersectionObserver.ts` | — | Lazy-load trigger |

### `useAdminApi()` Detail

Returns `{ get, post, put, del }` — all auto-attach the admin JWT from `AdminAuthContext`.
Every method throws on non-2xx with the error message from the response body.
Used by every admin page for all CRUD operations.

### `useProducts()` Detail

- Client-side in-memory cache (1-min TTL, 200 entries max)
- AbortController cancels in-flight requests on re-render
- Supports: category, gender, price range, search, limit, offset filters
- Used on product listing pages for client-side filtering

### `useDirectUpload()` Detail

- Obtains signed URL from `/api/admin/upload-url`
- XHR upload with per-file progress tracking
- Supports batch upload, per-file abort
- Returns reactive state: `uploads[]`, `isUploading`, `totalProgress`
- Used in `pages/admin/products.tsx` for multi-image product uploads

---

## 12. Database Schema

### Tables (Supabase PostgreSQL)

| Table | Key Columns | RLS | Admin Write Client |
|-------|------------|-----|-------------------|
| `products` | id, name, slug, sku, price, old_price, category, gender, image_url, images[], stock, is_hidden, is_featured | Yes | supabaseAdmin |
| `categories` | id, name | Yes | supabaseAdmin |
| `orders` | id, user_name, email, phone, address, items[], total_price, payment_method, payment_status, status, payment_proof, tracking_number, user_id | Yes | supabaseAdmin |
| `order_status_history` | id, order_id, old_status, new_status, changed_by, note | Yes | supabaseAdmin |
| `users` | id, name, email, phone, address, otp_code, otp_expires_at | Yes | supabaseAdmin |
| `hero_images` | id, image_url, title, subtitle, cta_text, cta_link, display_order, is_active | Yes | supabaseAdmin |
| `featured_collections` | id, title, description, image_url, link, display_order, is_active | Yes | supabaseAdmin |
| `testimonials` | id, customer_name, content, rating, display_order, is_active | Yes | supabaseAdmin |
| `announcements` | id, text, link, link_text, icon, display_order, is_active | Yes | supabaseAdmin |
| `homepage_sections` | id, section_key (unique), title, subtitle, content, image_url, cta_text, cta_link, metadata (JSONB), is_active | Yes | supabaseAdmin |
| `site_config` | id, theme_colors, typography, features, homepage_layout[], nav_menu[], updated_at | Yes | supabaseAdmin |
| `store_settings` | key (unique), value, updated_at | Yes | supabaseAdmin |
| `product_reviews` | id, product_id, order_id, user_name, rating, title, comment, is_verified_purchase, is_approved | Yes | supabaseAdmin |
| `favorites` | id, product_id, client_token, user_id | Yes | Mixed |
| `admin_users` | id, username | Yes | supabaseAdmin |
| `cart_items` | id, user_id, product_id, quantity | Yes | User context |
| `coupons` | id, code, discount_type, discount_value, min_order_amount, usage_limit, used_count, is_active, expires_at | Yes | supabaseAdmin |

### Storage Buckets

| Bucket | Purpose | Upload Method |
|--------|---------|--------------|
| `hero-images` | Hero slide images | Signed URL (AdminImageUpload) |
| `collection-images` | Collection images | Signed URL (AdminImageUpload) |
| `product-images` | Product images | Signed URL (useDirectUpload) |
| `payment-proofs` | Payment screenshots | Direct upload (checkout) |

---

## 13. File-by-File Reference

### Configuration Files

| File | Lines | Purpose |
|------|-------|---------|
| `next.config.js` | 110 | Next.js config: images, headers, compression |
| `package.json` | 46 | Dependencies and scripts |
| `tsconfig.json` | — | TypeScript config with `@/` path alias |
| `tailwind.config.js` | — | Tailwind CSS v4 config |
| `postcss.config.js` | — | PostCSS config |
| `next-env.d.ts` | — | Next.js type declarations |

### Library Layer (`lib/`)

| File | Lines | Exports | Integrates With |
|------|-------|---------|----------------|
| `supabase.ts` | 128 | `supabase` client, all DB types | Every file doing DB reads |
| `server-cache.ts` | 246 | `ServerCache`, `apiCache`, `ssgCache` | All cached API routes + SSG |
| `cache.ts` | 184 | 9 `getCached*()` functions, `invalidateSSGCache()` | `pages/index.tsx`, admin mutation APIs |
| `siteConfig.ts` | 65 | `getSiteConfig()`, `clearSiteConfigCache()` | `SiteConfigContext`, SSG |
| `admin-auth.ts` | 55 | `verifyAdminToken()`, `generateAdminToken()` | All admin API routes |
| `admin-otp.ts` | 55 | `generateOtpForUser()`, `verifyOtpForUser()` | `generate-otp.ts`, `login-otp.ts` |
| `admin-api-utils.ts` | 54 | `getSupabaseAdmin()`, `getAdminFromRequest()` | Some admin/public API routes |
| `user-auth.ts` | 131 | `generateUserToken()`, `verifyUserToken()`, `getUserFromRequest()` | Auth APIs, order API |
| `user-auth-middleware.ts` | 44 | `withUserAuth()`, `withOptionalUserAuth()` | Auth-required API routes |
| `rate-limit.ts` | 62 | `rateLimit()`, `getClientIp()` | OTP endpoints |
| `validation.ts` | 47 | Sanitize/validate utilities | API input validation |
| `email.ts` | 348 | `sendOtpEmail()`, `sendOrderConfirmationEmail()`, `sendDeliveryNotificationEmail()` | Auth, orders APIs |
| `constants.ts` | — | `STORE_NAME`, URLs, defaults | Multiple pages |
| `utils.ts` | — | Formatting utilities | Components |
| `hero-device-detector.ts` | — | Device/viewport detection for hero | `Hero.tsx` |

### Hooks (`hooks/`)

| File | Lines | Exports | Used By |
|------|-------|---------|---------|
| `useAdminApi.ts` | 80 | `useAdminApi()` → `{ get, post, put, del }` | All admin pages |
| `useProducts.ts` | 158 | `useProducts()`, `useProduct()` | Product listing pages |
| `useDirectUpload.ts` | 209 | `useDirectUpload()` → uploads, progress | `admin/products.tsx` |
| `useDebounce.ts` | — | `useDebounce(value, delay)` | Admin search fields |
| `useIntersectionObserver.ts` | — | `useIntersectionObserver()` | Lazy-loaded sections |

### Context Providers (`context/`)

| File | Lines | Exports | Wraps |
|------|-------|---------|-------|
| `SiteConfigContext.tsx` | 73 | `SiteConfigProvider`, `useSiteConfig()` | All pages (via `_app.tsx`) |
| `UserAuthContext.tsx` | 182 | `UserAuthProvider`, `useUserAuth()` | All pages (via `_app.tsx`) |
| `CartContext.tsx` | 229 | `CartProvider`, `useCart()` | All pages (via `_app.tsx`) |
| `FavoritesContext.tsx` | 250 | `FavoritesProvider`, `useFavorites()` | All pages (via `_app.tsx`) |
| `ToastContext.tsx` | 65 | `ToastProvider`, `useToast()` | Admin pages (per-page) |
| `AdminAuthContext.tsx` | 80 | `AdminAuthProvider`, `useAdminAuth()` | Admin pages (per-page) |

### Components (`components/`)

| File | Lines | Type | Data Source |
|------|-------|------|-------------|
| `Hero.tsx` | 282 | Homepage section | `hero_images` table |
| `LimitedDrop.tsx` | — | Homepage section | `homepage_sections` metadata |
| `ValueProposition.tsx` | — | Homepage section | `homepage_sections` metadata |
| `FeaturedCollections.tsx` | — | Homepage section | `featured_collections` table |
| `CollectionsHighlight.tsx` | — | Homepage section | Derived from collections |
| `ProcessSteps.tsx` | — | Homepage section | `homepage_sections` metadata |
| `Craftsmanship.tsx` | — | Homepage section | `homepage_sections` metadata |
| `Testimonials.tsx` | — | Homepage section | `testimonials` table |
| `Newsletter.tsx` | — | Homepage section | Static + `homepage_sections` |
| `InstagramGallery.tsx` | — | Homepage section | Static |
| `LogoMarquee.tsx` | — | Homepage section | Static |
| `BentoGrid.tsx` | — | Homepage section | Static |
| `SignaturePiece.tsx` | — | Homepage section | Static |
| `Header.tsx` | 301 | Layout | SiteConfig, Cart, Auth, Favorites |
| `Footer.tsx` | — | Layout | Static |
| `ProductCard.tsx` | — | Shared | Product prop |
| `ProductCarousel.tsx` | — | Product detail | Images array prop |
| `ProductAccordion.tsx` | — | Product detail | Product data prop |
| `ProductReviews.tsx` | — | Product detail | Reviews array prop |
| `OrderReviewForm.tsx` | — | Order | Order data prop |
| `LoginForm.tsx` | — | Auth | UserAuthContext |
| `Toast.tsx` | — | UI | ToastContext |
| `admin/AdminLayout.tsx` | 372 | Admin layout | AdminAuthContext |
| `admin/AdminImageUpload.tsx` | 210 | Admin form | Upload URL API |
| `admin/CommandPalette.tsx` | 162 | Admin utility | Supabase search |

### Admin Pages (`pages/admin/`)

| File | Lines | CRUD Targets | API Endpoints Used |
|------|-------|--------------|--------------------|
| `dashboard.tsx` | 304 | — (read-only) | GET `/dashboard` |
| `products.tsx` | 883 | Products | `/products`, `/products/[id]`, `/categories`, `/upload-url` |
| `orders.tsx` | 685 | Orders | `/orders`, `/orders/[id]`, `/orders/all` |
| `categories.tsx` | 311 | Categories | `/categories`, `/categories/[id]` |
| `homepage.tsx` | 1736 | Hero, Collections, Testimonials, Announcements, Sections | `/hero-images`, `/hero-overlay`, `/featured-collections`, `/testimonials`, `/announcements`, `/homepage-sections` |
| `builder.tsx` | 465 | Site config | `/site-config`, `/revalidate` |
| `settings.tsx` | 345 | Store settings | `/settings` |
| `reviews.tsx` | 514 | Reviews | `/reviews`, `/reviews/[id]` |

### API Routes (`pages/api/`)

| File | Lines | Methods | Auth | Cache |
|------|-------|---------|------|-------|
| **Public** | | | | |
| `products/index.ts` | 56 | GET | — | 5-min + CDN |
| `products/[id].ts` | — | GET | — | 5-min + CDN |
| `categories.ts` | — | GET | — | — |
| `orders/index.ts` | 189 | GET, POST | User JWT | — |
| `orders/[id].ts` | — | GET | User JWT | — |
| `orders/cancel.ts` | — | POST | User JWT | — |
| `cart/index.ts` | — | GET, POST, DELETE | User JWT | — |
| `cart/[id].ts` | — | PUT, DELETE | User JWT | — |
| `favorites/index.ts` | — | GET, POST, DELETE | Optional | — |
| `reviews/index.ts` | — | GET, POST | Optional | — |
| `reviews/[id].ts` | — | GET | — | — |
| `newsletter.ts` | — | POST | — | — |
| `coupons/validate.ts` | — | POST | — | — |
| `store-settings.ts` | — | GET | — | — |
| `upload/payment-proof.ts` | — | POST | User JWT | — |
| **Auth** | | | | |
| `auth/generate-otp.ts` | — | POST | — | Rate limited |
| `auth/verify-otp.ts` | — | POST | — | Rate limited |
| `auth/me.ts` | — | GET | Cookie | — |
| `auth/profile.ts` | — | PUT | Cookie | — |
| `auth/logout.ts` | — | POST | Cookie | — |
| `auth/delete.ts` | — | DELETE | Cookie | — |
| **Admin** | | | | |
| `admin/generate-otp.ts` | 48 | POST | — | — |
| `admin/login-otp.ts` | 47 | POST | — | — |
| `admin/login.ts` | — | POST | — | — |
| `admin/verify.ts` | 22 | GET/POST | Admin JWT | — |
| `admin/dashboard.ts` | 72 | GET | Admin JWT | — |
| `admin/products/index.ts` | 100 | GET, POST | Admin JWT | products → /, /products |
| `admin/products/[id].ts` | 101 | GET, PUT, DELETE | Admin JWT | products → /, /products |
| `admin/orders/index.ts` | 41 | GET | Admin JWT | — |
| `admin/orders/[id].ts` | 170 | GET, PUT, DELETE | Admin JWT | orders, products |
| `admin/orders/all.ts` | 118 | DELETE | Admin JWT | orders, products → / |
| `admin/categories/index.ts` | 68 | GET, POST | Admin JWT | categories → / |
| `admin/categories/[id].ts` | 78 | GET, PUT, DELETE | Admin JWT | categories → / |
| `admin/homepage-sections.ts` | — | GET, PUT | Admin JWT | homepage_sections → / |
| `admin/hero-images.ts` | — | GET, POST, PUT, DELETE | Admin JWT | hero_images → / |
| `admin/hero-overlay.ts` | — | GET, PUT | Admin JWT | hero_images → / |
| `admin/featured-collections.ts` | — | GET, POST, PUT, DELETE | Admin JWT | featured_collections → / |
| `admin/testimonials.ts` | — | GET, POST, PUT, DELETE | Admin JWT | testimonials → / |
| `admin/announcements.ts` | — | GET, POST, PUT, DELETE | Admin JWT | announcements → / |
| `admin/reviews/index.ts` | 77 | GET | Admin JWT | — |
| `admin/reviews/[id].ts` | 103 | GET, PUT, DELETE | Admin JWT | reviews |
| `admin/settings.ts` | 70 | GET, PUT | Admin JWT | store_settings, site_config → / |
| `admin/site-config.ts` | 76 | GET, PUT | Admin JWT | site_config → / |
| `admin/upload-url.ts` | — | POST | Admin JWT | — |
| `admin/upload.ts` | — | POST | Admin JWT | — |
| `admin/revalidate.ts` | — | POST | Admin JWT | Tag-based |

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total TypeScript/TSX files | ~75 |
| Admin pages | 8 |
| Public pages | 19 |
| API routes | 42 |
| React contexts | 6 |
| Custom hooks | 6 |
| Homepage sections | 15 (admin-controllable) |
| Database tables | ~17 |
| Storage buckets | 4 |
| Lines of code (approx) | ~15,000 |
