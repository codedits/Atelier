# Dynamic Content Management - Setup Guide

## Overview
Your Atelier website now supports fully dynamic content management. All homepage images, product images, and content can be edited through the admin panel and stored in Supabase.

## Required Setup Steps

### 1. Execute the Dynamic Content Schema

Run the SQL schema to create the necessary tables:

1. Open Supabase Dashboard (https://app.supabase.com)
2. Navigate to your project
3. Click **SQL Editor** in the left sidebar
4. Open the file `lib/supabase-dynamic-content-schema.sql` from your project
5. Copy all the SQL code
6. Paste it into the Supabase SQL Editor
7. Click **Run** to execute

This will create:
- `hero_images` - Homepage hero carousel images
- `featured_collections` - Category collection cards
- `testimonials` - Customer testimonials
- `homepage_sections` - Signature piece & craftsmanship sections
- `product_images` - Multiple images per product

### 2. Create Supabase Storage Buckets

You need to create three public storage buckets for images:

**Option A: Via Supabase Dashboard (Recommended)**

1. In Supabase Dashboard, click **Storage** in the left sidebar
2. Click **New bucket**
3. Create the following buckets (one at a time):
   - **Name:** `product-images`, **Public:** ✅ Yes
   - **Name:** `hero-images`, **Public:** ✅ Yes
   - **Name:** `collection-images`, **Public:** ✅ Yes
4. For each bucket, click the bucket → **Policies** → **New Policy** → **Full access** → Select "Enable read access for all users" → **Save**

**Option B: Via SQL (Alternative)**

Run this SQL in the SQL Editor:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('hero-images', 'hero-images', true),
  ('collection-images', 'collection-images', true);

-- Create public access policies
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES
  ('product-images', 'Public Read', 'bucket_id = ''product-images'''),
  ('hero-images', 'Public Read', 'bucket_id = ''hero-images'''),
  ('collection-images', 'Public Read', 'bucket_id = ''collection-images''');
```

### 3. Add Service Role Key to Environment

The image upload feature requires the Supabase service role key:

1. In Supabase Dashboard, go to **Settings** → **API**
2. Find the **service_role** key (under "Project API keys")
3. **⚠️ IMPORTANT:** This is a secret key - never commit it to Git!
4. Open your `.env.local` file
5. Add this line (replace with your actual key):

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Your `.env.local` should now have:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
```

### 4. Restart Development Server

After adding the service role key:

```powershell
# Stop the dev server (Ctrl+C if running)
# Then restart it
npm run dev
```

## Using the Admin Panel

### Managing Hero Images

1. Login to admin panel: http://localhost:3000/admin
2. Click **Homepage** in the sidebar
3. Click **Hero Images** tab
4. Click **+ Add Hero Image**
5. Fill in:
   - Title (large text)
   - Subtitle (smaller text below title)
   - Image (upload file or paste URL)
   - CTA Button Text (e.g., "Shop Now")
   - CTA Link (e.g., "/products")
   - Display Order (for carousel ordering)
   - Active checkbox (to show/hide)
6. Click **Upload** to upload the image to Supabase
7. Click **Add Hero Image** to save

### Managing Products with Images

1. Go to **Products** in admin sidebar
2. Click **+ Add Product** or edit existing product
3. Fill in product details
4. For the image:
   - Click **Choose File** to select an image
   - Click **Upload** button to upload to Supabase Storage
   - The uploaded URL will automatically populate
   - Or paste an external image URL directly
5. Click **Add Product** to save

### Other Content Types

- **Featured Collections:** Coming soon - manage category collection cards
- **Testimonials:** Coming soon - manage customer testimonials
- **Other Sections:** Coming soon - manage signature piece & craftsmanship sections

## How It Works

### Image Upload Flow

1. Admin selects an image file in the admin panel
2. Image is converted to base64 and sent to `/api/admin/upload`
3. Server verifies admin JWT token
4. Image is uploaded to appropriate Supabase Storage bucket
5. Public URL is returned and stored in database
6. Frontend displays image using Next.js `<Image />` component

### Database Structure

- **hero_images:** Homepage hero/carousel images with title, subtitle, CTA
- **featured_collections:** Category cards with image and link
- **testimonials:** Customer reviews with name, content, rating
- **homepage_sections:** Reusable sections like signature piece, craftsmanship
- **product_images:** Multiple images per product (main + gallery)

### API Endpoints

**Public (no auth required):**
- `GET /api/admin/hero-images` - Fetch active hero images
- `GET /api/admin/homepage-sections` - Fetch active sections

**Admin only (JWT required):**
- `POST /api/admin/upload` - Upload image to Supabase Storage
- `POST /api/admin/hero-images` - Create hero image
- `PUT /api/admin/hero-images` - Update hero image
- `DELETE /api/admin/hero-images?id=xxx` - Delete hero image
- `PUT /api/admin/homepage-sections` - Update homepage section

## Troubleshooting

### "Failed to upload image" Error

**Cause:** Missing or incorrect `SUPABASE_SERVICE_ROLE_KEY`

**Solution:**
1. Double-check the key in `.env.local`
2. Make sure there are no extra spaces or quotes
3. Restart the dev server after adding the key
4. Check Supabase Dashboard → Settings → API to verify the key

### Storage Bucket Errors

**Cause:** Buckets not created or not public

**Solution:**
1. Go to Supabase Dashboard → Storage
2. Verify buckets exist: `product-images`, `hero-images`, `collection-images`
3. Check each bucket is marked as **Public**
4. Verify bucket policies allow public read access

### Images Not Displaying

**Cause:** Next.js doesn't allow the Supabase Storage domain

**Solution:**
Add Supabase Storage domain to `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Add this for Supabase Storage
      },
    ],
  },
}

module.exports = nextConfig
```

### Database Schema Errors

**Cause:** Schema not executed or conflicting tables

**Solution:**
1. Check if tables exist: Supabase Dashboard → Table Editor
2. If tables already exist but structure is wrong, drop and recreate:
   ```sql
   DROP TABLE IF EXISTS hero_images CASCADE;
   DROP TABLE IF EXISTS featured_collections CASCADE;
   -- etc.
   ```
3. Then re-run the schema from `lib/supabase-dynamic-content-schema.sql`

## Next Steps

After completing setup:

1. ✅ Test uploading a product image in admin panel
2. ✅ Test adding a hero image in homepage content manager
3. ✅ Verify images display on the public site
4. 🔄 Connect frontend components to fetch from Supabase (next phase)
5. 🔄 Add remaining content managers (collections, testimonials, sections)

## Security Notes

⚠️ **IMPORTANT:**

- Never commit `.env.local` to Git (already in `.gitignore`)
- Never share your `SUPABASE_SERVICE_ROLE_KEY` publicly
- For production, use environment variables in Vercel/hosting platform
- Rotate admin password and JWT secret before going live
- Consider adding rate limiting to upload endpoints for production

## File Size Limits

- Maximum file size: **10 MB**
- Supported formats: JPEG, PNG, WebP, GIF
- Recommended: Compress images before uploading for faster load times
- Tools: TinyPNG, Squoosh, ImageOptim

## Support

If you encounter issues:
1. Check browser console for errors (F12 → Console)
2. Check server terminal for API errors
3. Verify all environment variables are set correctly
4. Ensure Supabase project is active and not paused

---

**Setup Complete! 🎉**

Once you've followed all steps above, your dynamic content management system will be fully functional. You can now manage all website content through the admin panel without touching code.
