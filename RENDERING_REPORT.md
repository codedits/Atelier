# Rendering Architecture & Recommendations

## 1. Public catalog pages (ISR / SSG)
**Pages:** `index.tsx` (home & product listing), `[id].tsx` (product details)
**Current:** ISR with `revalidate: 60`, hybrid blocking fallback for new products. ✅

**Suggestions:**
- Consider pre-building more popular product pages if analytics show some products are frequently accessed → reduces first “blocking fallback” request.
- Keep `revalidate` around 60s for near-real-time updates; can adjust if content changes more or less frequently.
- For global theme/customization (colors, opacity, hero banners), fetch via SSR / ISR at layout level → avoid flashes on page load. Use CSS variables to propagate styles without re-rendering.

## 2. User-specific pages (CSR)
**Pages:** `cart.tsx`, `checkout.tsx`, `account.tsx`, `favorites.tsx`, `[id].tsx` (orders), `order-confirmation.tsx`
**Current:** Fully client-rendered using contexts (`CartContext`, `UserAuthContext`, `FavoritesContext`). ✅

**Suggestions:**
- Keep CSR for user-specific data (auth, cart, favorites).
- Ensure server-side validation on APIs to prevent unauthorized access.
- For smoother UX, you could prefetch cart or order summary via API on app shell load, but render with client state to keep pages responsive.

## 3. Static content pages (SSG)
**Pages:** `about.tsx`, `terms-of-service.tsx`, `privacy-policy.tsx`, `shipping-info.tsx`, etc.
**Current:** Fully static, no data fetching. ✅

**Suggestions:**
- Perfect as-is. No changes needed unless you want dynamic banners or promotions on these pages, which would require ISR.

## 4. Admin pages / _app.tsx / _document.tsx
**Admin:** client-only CSR, uses `AdminAuthContext`. ✅
**_app.tsx:** app shell for providers/context. ✅
**_document.tsx:** SSR, for initial HTML only. ✅

**Suggestions:**
- Keep admin pages CSR; server-side auth checks are essential.
- `_app.tsx` can optionally fetch global settings via SSR/ISR if you want all pages to inherit colors, opacity, hero components before hydration.

## 5. General Recommendations
- **Global layout settings / theme:** Fetch via SSR/ISR instead of client-only to eliminate flashes when colors/opacity change.
- **CSS Variables:** Use CSS variables for dynamic styling → smooth updates without re-rendering React components.
- **Optimize ISR caching:** For pages that rarely change, increase revalidate interval; for frequently updated pages, keep lower.
- **Blocking fallback:** For `[id].tsx` is fine; consider pre-building top N products to reduce server load.
- **API caching:** Make sure `s-maxage` + `stale-while-revalidate` is set on API responses used by ISR pages → reduces ISR regeneration latency.
- **Client fetch:** For user/admin pages is correct, no SSR needed; keep auth tokens and session logic client-side.

## 6. E-commerce Specific Improvements 🚀
- **SEO & Structured Data:** 
  - Ensure all product pages have full JSON-LD `Product` schema (currently present in `[id].tsx`). 
  - Add `BreadcrumbList` and `Organization` schema globally to improve search visibility.
- **Performance (Core Web Vitals):**
  - Implement `font-display: swap` for custom fonts to reduce FOIT (Flash of Invisible Text).
  - Ensure `priority` attribute is used on LCP images (Hero banners, main product images) to improve LCP scores.
- **UX / Conversion:**
  - **Optimistic UI:** Immediately update Cart/Wishlist UI on click, then reconcile with server response to make the app feel instant.
  - **Skeleton Loading:** Standardize skeleton loaders across all CSR pages (Cart, Account) to match the polish of the Product Detail page.
  - **Persisted Cart:** Ensure cart state syncs between local storage and database when a user logs in.
- **Analytics:** 
  - Integrate GA4 or similar for tracking e-commerce events: "Add to Cart", "Begin Checkout", and "Purchase".
