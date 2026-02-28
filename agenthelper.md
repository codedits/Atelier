his document provides a comprehensive overview of a modern e-commerce web application. It is designed to help an AI agent understand the core logic, data flow, architecture, and performance optimizations built into the platform.

**Tech Stack:**
- **Framework:** Next.js (App Router)
- **UI Library:** React, Tailwind CSS, Radix UI (shadcn/ui primitives)
- **Language:** TypeScript
- **Database / Backend as a Service:** PostgreSQL (Supabase)
- **Authentication:** Custom JWT-based passwordless OTP auth
- **Key Libraries:** React Query (client-side state), TanStack Table, carousels (Embla), Framer Motion, Lenis (smooth scroll).

---

## 2. Why the UI is Extremely Smooth & Prevents Layout Shift

The application feels highly premium and smooth due to several specific frontend architecture choices:

1. **Next.js App Router (SSR & ISR):**
   - **SSR (Server-Side Rendering):** Most product and collection pages are server-rendered. By the time the HTML reaches the browser, the data is already populated, preventing the typical "loading spinner to content" flash.
   - **ISR (Incremental Static Regeneration):** The homepage and certain high-traffic routes use timed revalidation. They are served as highly cached static files for immediate load times, while being regenerated in the background to keep data fresh.

2. **Preventing Cumulative Layout Shift (CLS):**
   - **`next/image` Optimization:** All images use Next.js's native image component with strict width/height attributes or `fill` with `sizes`. This reserves the exact visual space in the DOM before the image downloads, entirely eliminating layout shifts as images load.
   - **Loading Skeletons & Suspense Boundaries:** The application actively uses React `<Suspense>` combined with skeleton components (e.g., product grid skeletons, footer skeletons). These skeletons occupy the same dimensional footprint as the final content, preventing jumping when data resolves.
   - **Pre-calculated aspect ratios:** Product cards and image galleries utilize enforced CSS aspect ratios (via `@radix-ui/react-aspect-ratio`) to guarantee containers don't collapse or expand unpredictably during rendering.

3. **Animation and Interaction Smoothness:**
   - **Lenis Smooth Scroll:** Global scroll hijacking via Lenis ensures buttery-smooth rendering during vertical navigation, overriding native browser scroll stuttering.
   - **Framer Motion:** Viewport-triggered fade-ins and scroll reveals use hardware-accelerated CSS transforms rather than layout property animations (like margin or padding).
   - **Optimistic UI Updates:** Actions like adding to the cart update the local state immediately before the server responds, making interactions feel instantaneous.

---

## 3. Core Logic & Data Flow

### A. Authentication Flow (Passwordless JWT)
1. **Request OTP:** User inputs email on the frontend $\rightarrow$ POST request to the auth API $\rightarrow$ Server generates a 6-digit OTP, stores it with a TTL, and emails it securely.
2. **Verify OTP:** User inputs OTP $\rightarrow$ POST to verify endpoint $\rightarrow$ Server validates, upserts the user profile, generates a JWT securely, and sets an `HttpOnly` cookie.
3. **Session State:** The frontend uses React Query to poll the session endpoint to read the HttpOnly cookie and maintain the global user session in a React Context.

### B. Cart and Checkout Flow
1. **Local State Cart:** To prevent server-latency layout blocking, the cart heavily utilizes `localStorage` managed by a global Context.
2. **Deferred Validation:** On mount, the client waits slightly, then validates local cart items against current database prices and inventory to ensure consistency.
3. **Checkout Execution (Server Action):**
   - User submits the checkout form.
   - A secure Next.js Server Action handles the transaction.
   - **Secure Pricing:** The server completely ignores frontend price data. It fetches current prices and active discounts natively from the DB.
   - **Stock Deduction:** Runs a database RPC to atomically verify inventory levels, deduct stock preventing race conditions, create order rows, and log the transaction.

---

## 4. Frontend Architecture (Public Store)

The public-facing storefront operates under a route group, utilizing Next.js layouts to share the Navigation and Footer seamlessly across routes.

### Dynamic Homepage Engine
The homepage is deeply data-driven. Instead of hardcoded sections, it reads an ordered array from the central configuration table. An engine iterates through this array and mounts specific React Server Components:
- **Hero Carousel:** A high-impact media banner.
- **Product Grids / Featured Collections:** Sever-rendered grids showcasing specific database entities.
- **Lookbook / Editorial Sections:** Image and masonry layouts.

### Product Presentation
- **Product Detail Pages (PDP):** Uses dynamic routing. Fetches deeply nested relational data (variants, sizes, colors, inventory) efficiently server-side.
- **Client-side Interactivity:** A product info component manages user selections, dynamically computing the final price and checking variant inventory live to prevent overselling.

---

## 5. Admin Panel Architecture

The backend management system operates under a protected administrative route structure, gated via middleware checking a secure cookie.

### Structural Layout
- **Sidebar Navigation:** A persistent, client-side routed sidebar for swift navigation across entities.
- **Command Palette:** A global search function (⌘K) allowing admins to jump instantly between products, orders, or pages.

### Key Management Modules
1. **Dashboard & Analytics:** Utilizes charting libraries to visualize revenue, recent sales, and flags low-stock products. Data is heavily cached to reduce DB load.
2. **Product Catalog Management:**
   - **Data Tables:** Highly performant, filterable, and sortable tables for managing thousands of products.
   - **Variant Handling:** A sophisticated form interface automatically generates Cartesian products of size/color options to create sub-variants.
3. **Order Management:**
   - Admins can update order statuses natively. Status updates selectively trigger customer notification emails.
   - Includes UI for manual verification of offline payment proofs (e.g., bank transfer screenshots).
4. **Visual Builders:**
   - **Menu Builder & Homepage Builder:** Implements Drag-and-Drop capability to allow admins to visually build navigation links or reorder homepage sections. These save JSON structures directly to the database.

---

## 6. Database and Services Layer

### Database Schema Highlights
- **Products & Variants Normalized:** `products` $\rightarrow$ 1:N $\rightarrow$ `product_variants` $\rightarrow$ 1:N $\rightarrow$ `inventory_levels`. This strict normalization ensures stock is tracked precisely per physical location and SKU.
- **Key-Value Config:** A site config table acts as a global singleton. It holds JSON structures for theme colors, enabled features, typography choices, and layout orders.

### Service encapsulation
To abstract business logic away from the UI, the app utilizes robust Server Services:
- **Transactional Services:** Handles CRUD and complex transactional processes, utilizing privileged database clients to securely bypass standard user policies server-side.
- **Store Configuration Service:** An aggressively cached service that loads the core site data into memory, passing it down to the Root Layout where it is distributed to the client via Context. This controls everything from the site's primary HSL colors to global discount active states.

---
*End of Generic Architecture Report.*
