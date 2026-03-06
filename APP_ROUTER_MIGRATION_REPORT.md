# App Router Migration Report

Last updated: 2026-03-05
Owner: Copilot (implementation tracker)

## Objective
Migrate storefront routes from Pages Router to App Router to separate server/client boundaries and improve performance while keeping `pages/api/*` stable during transition.

## Current Status
### ✅ Completed
- App Router foundation
  - `app/layout.tsx`
  - `app/providers.tsx`
  - `app/client-effects.tsx`
- Shared compatibility
  - Navigation hooks aligned to App Router (`next/navigation`) after Pages Router removal
- Storefront routes migrated
  - `app/page.tsx`
  - `app/favorites/page.tsx`
  - `app/products/page.tsx`
  - `app/products/[id]/page.tsx`
  - `app/cart/page.tsx`
  - `app/checkout/page.tsx`
  - `app/account/page.tsx`
  - `app/orders/[id]/page.tsx`
  - `app/login/page.tsx`
  - `app/order-confirmation/page.tsx`
  - `app/about/page.tsx`
  - `app/cookie-policy/page.tsx`
  - `app/faq/page.tsx`
  - `app/gift-guide/page.tsx`
  - `app/journal/page.tsx`
  - `app/privacy-policy/page.tsx`
  - `app/returns/page.tsx`
  - `app/shipping-info/page.tsx`
  - `app/terms-of-service/page.tsx`
- Admin routes migrated (complete UI)
  - `app/admin/page.tsx`
  - `app/admin/dashboard/page.tsx`
  - `app/admin/products/page.tsx`
  - `app/admin/orders/page.tsx`
  - `app/admin/categories/page.tsx`
  - `app/admin/homepage/page.tsx`
  - `app/admin/lookbook/page.tsx`
  - `app/admin/reviews/page.tsx`
  - `app/admin/settings/page.tsx`
  - `app/admin/builder/page.tsx`
- Admin API migrated (phase 1: auth)
  - `app/api/admin/login/route.ts`
  - `app/api/admin/verify/route.ts`
  - `app/api/admin/generate-otp/route.ts`
  - `app/api/admin/login-otp/route.ts`
- Full API migration to App Router
  - All remaining `pages/api/*` endpoints moved to `app/api/*`
  - Added compatibility adapter: `lib/next-api-route-adapter.ts`
  - Inlined API logic directly into `app/api/**/route.ts` files
  - Added native multipart upload route: `app/api/upload/payment-proof/route.ts`
- Pages Router fully removed
  - Removed entire `pages/` tree (UI + API)
  - Added App Router not-found page: `app/not-found.tsx`
- Legacy pages removed (to prevent route conflicts)
  - `pages/index.tsx`
  - `pages/favorites.tsx`
  - `pages/products/index.tsx`
  - `pages/products/[id].tsx`
  - `pages/cart.tsx`
  - `pages/checkout.tsx`
  - `pages/account.tsx`
  - `pages/orders/[id].tsx`
  - `pages/login.tsx`
  - `pages/order-confirmation.tsx`
  - `pages/about.tsx`
  - `pages/cookie-policy.tsx`
  - `pages/faq.tsx`
  - `pages/gift-guide.tsx`
  - `pages/journal.tsx`
  - `pages/privacy-policy.tsx`
  - `pages/returns.tsx`
  - `pages/shipping-info.tsx`
  - `pages/terms-of-service.tsx`
  - `pages/admin/index.tsx`
  - `pages/admin/dashboard.tsx`
  - `pages/admin/products.tsx`
  - `pages/admin/orders.tsx`
  - `pages/admin/categories.tsx`
  - `pages/admin/homepage.tsx`
  - `pages/admin/lookbook.tsx`
  - `pages/admin/reviews.tsx`
  - `pages/admin/settings.tsx`
  - `pages/admin/builder.tsx`
  - `pages/api/admin/login.ts`
  - `pages/api/admin/verify.ts`
  - `pages/api/admin/generate-otp.ts`
  - `pages/api/admin/login-otp.ts`
  - `pages/api/**/*` (all remaining API endpoints)
  - `pages/_app.tsx`
  - `pages/_document.tsx`
  - `pages/` folder removed

### 🚧 In Progress
- Metadata parity hardening (SEO JSON-LD remains route-specific; full parity pass deferred)

### ⏳ Pending
- Optional cleanup: progressively replace adapter-based request/response bridging with fully native `NextRequest/NextResponse` handlers

## Verification Log
- `npm run build` ✅ passing after current migration slice
- App route ownership now includes:
  - `/`
  - `/admin`
  - `/admin/builder`
  - `/admin/categories`
  - `/admin/dashboard`
  - `/admin/homepage`
  - `/admin/lookbook`
  - `/admin/orders`
  - `/admin/products`
  - `/admin/reviews`
  - `/admin/settings`
  - `/api/*` (all API endpoints)
  - `/favorites`
  - `/products`
  - `/products/[id]`
  - `/cart`
  - `/checkout`
  - `/account`
  - `/orders/[id]`
  - `/login`
  - `/order-confirmation`
  - `/about`
  - `/cookie-policy`
  - `/faq`
  - `/gift-guide`
  - `/journal`
  - `/privacy-policy`
  - `/returns`
  - `/shipping-info`
  - `/terms-of-service`

## Risks / Notes
- `npm run lint` script currently incompatible with Next 16 CLI behavior (`next lint` issue); build remains the verification gate for now.
- Mixed router phase is intentional; `pages/api/*` is kept unchanged to minimize migration risk.
- Header currently supports both router systems via compatibility adapter.

## Next Suggested Slice
1. Optional hardening pass: replace adapter-based routes with native App Router handlers incrementally.
2. Optional SEO metadata parity hardening pass for storefront routes.
3. Optional dependency cleanup and prune any unused legacy helpers.
