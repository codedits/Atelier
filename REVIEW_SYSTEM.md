# Product Review System Documentation

This document describes the product review/feedback system for Atelier.

## Features

### 1. Customer Reviews
- Customers can leave reviews on products from delivered orders
- Reviews include: star rating (1-5), optional title, and comment
- Verified purchase badge for authenticated reviews
- One review per product per order (prevents duplicates)

### 2. Product Page Reviews Section
- Displays reviews below product information
- Shows average rating with star visualization
- Rating distribution bar chart (5-star to 1-star breakdown)
- Individual review cards with user name, date, and verified purchase badge
- "Show All" button for viewing more reviews

### 3. Order Page Review Form
- Appears only for delivered orders
- Expandable form for each product in the order
- Real-time validation and feedback
- Success confirmation after submission

### 4. Admin Review Management
- View all reviews with filtering options
- Filter by: approval status, rating, search term
- Toggle approval status (approved/pending)
- Delete reviews
- Stats overview (total, approved, pending, average rating)

### 5. Delivery Email Notification
- Automatic email when order status changes to "delivered"
- Includes order summary and items
- Call-to-action to leave a review
- Beautiful HTML email template

## Files Created/Modified

### New Files:
- `lib/supabase-reviews-schema.sql` - Database schema for reviews
- `pages/api/reviews/index.ts` - Public API for fetching/creating reviews
- `pages/api/reviews/[id].ts` - Single review API
- `pages/api/admin/reviews/index.ts` - Admin reviews list API
- `pages/api/admin/reviews/[id].ts` - Admin single review API (GET/PUT/DELETE)
- `pages/admin/reviews.tsx` - Admin reviews management page
- `components/ProductReviews.tsx` - Reviews display component for product pages
- `components/OrderReviewForm.tsx` - Review form for order detail page

### Modified Files:
- `lib/supabase.ts` - Added ProductReview and ProductReviewStats interfaces
- `lib/email.ts` - Added sendDeliveryNotificationEmail function
- `pages/products/[id].tsx` - Added ProductReviews component
- `pages/orders/[id].tsx` - Added OrderReviewForm for delivered orders
- `pages/api/admin/orders/[id].ts` - Sends delivery email on status change
- `components/admin/AdminLayout.tsx` - Added Reviews link to navigation
- `components/index.ts` - Exported new components

## Database Setup

Run the SQL in `lib/supabase-reviews-schema.sql` in your Supabase SQL Editor to create:
- `product_reviews` table
- Indexes for performance
- Row Level Security policies
- `product_review_stats` view
- `user_email` column on orders table

## API Endpoints

### Public:
- `GET /api/reviews?product_id=xxx` - Get reviews for a product
- `POST /api/reviews` - Create a new review (requires delivered order)

### Admin:
- `GET /api/admin/reviews` - List all reviews (with filtering)
- `GET /api/admin/reviews/[id]` - Get single review
- `PUT /api/admin/reviews/[id]` - Update approval status
- `DELETE /api/admin/reviews/[id]` - Delete a review

## Environment Variables

For email notifications, ensure these are set:
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_SECURE` - Use TLS (true/false)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - Sender email address
- `NEXT_PUBLIC_APP_URL` - App URL for email links
