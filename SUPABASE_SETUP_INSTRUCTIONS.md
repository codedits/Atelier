# 🚀 SUPABASE SETUP - QUICK START

## Step 1: Run SQL Schema (5 minutes)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `COMPLETE_SUPABASE_SETUP.sql` from your project
6. Copy ALL the SQL code (entire file)
7. Paste it into the Supabase SQL Editor
8. Click **Run** or press `Ctrl+Enter`
9. Wait for "Success. No rows returned" message

**What this does:**
- Creates all database tables (products, orders, categories, admin_users, hero_images, etc.)
- Sets up Row Level Security (RLS) policies
- Creates indexes for performance
- Inserts sample data (products, categories, hero image, testimonials)
- Creates default admin user (username: `admin`, password: `admin123`)

---

## Step 2: Create Storage Buckets (2 minutes)

### Option A: Via Dashboard (Recommended)

1. In Supabase Dashboard, click **Storage** in left sidebar
2. Click **New bucket** button
3. Create these 3 buckets (one at a time):

   **Bucket 1:**
   - Name: `product-images`
   - Public: ✅ **Yes**
   - Click **Create bucket**

   **Bucket 2:**
   - Name: `hero-images`
   - Public: ✅ **Yes**
   - Click **Create bucket**

   **Bucket 3:**
   - Name: `collection-images`
   - Public: ✅ **Yes**
   - Click **Create bucket**

4. For each bucket, verify it's set to **Public** (you should see a green "Public" badge)

### Option B: Via SQL (Alternative)

If you prefer SQL, go to SQL Editor and run:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('hero-images', 'hero-images', true),
  ('collection-images', 'collection-images', true)
ON CONFLICT (id) DO NOTHING;
```

---

## Step 3: Add Service Role Key to .env.local (1 minute)

1. In Supabase Dashboard, go to **Settings** → **API**
2. Find the **Project API keys** section
3. Copy the `service_role` key (NOT the anon key)
   - ⚠️ **Keep this secret!** Never commit to Git
4. Open your `.env.local` file in the project
5. Add this line:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Your `.env.local` should now look like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...   ← Add this line
JWT_SECRET=your-jwt-secret
```

---

## Step 4: Restart Dev Server (30 seconds)

```powershell
# Stop the server (Ctrl+C if running)
# Then restart:
npm run dev
```

---

## ✅ Verification Steps

### Test Admin Panel:

1. Go to: http://localhost:3000/admin
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Click **Products** → Try creating a product with image upload
4. Click **Homepage** → Try adding a hero image

### Test Public Site:

1. Go to: http://localhost:3000
2. Hero section should show the default hero image from database
3. Go to: http://localhost:3000/products
4. Should see sample products from database

---

## 🎉 You're Done!

Everything should now work:
- ✅ Product creation with image uploads
- ✅ Hero image management from admin panel
- ✅ Products fetched from Supabase
- ✅ Dynamic homepage content

---

## 🔒 Important Security Notes

**Before going to production:**

1. **Change admin password:**
   ```sql
   -- In Supabase SQL Editor, run:
   UPDATE admin_users 
   SET password_hash = '$2b$10$YOUR_NEW_BCRYPT_HASH' 
   WHERE username = 'admin';
   ```
   Generate bcrypt hash: https://bcrypt-generator.com/

2. **Rotate JWT_SECRET** in `.env.local` to a random 32+ character string

3. **Never commit** `.env.local` to Git (already in `.gitignore`)

4. **For production deployment** (Vercel/etc):
   - Add all environment variables in hosting dashboard
   - Use production Supabase project (not dev)

---

## 🆘 Troubleshooting

### "Failed to upload image"
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`
- Restart dev server after adding the key
- Check Storage buckets exist and are public

### "Failed to save product"
- Check browser console (F12) for error details
- Verify SQL schema was executed successfully
- Check Supabase logs in Dashboard → Logs

### Images not displaying
- Verify buckets are set to **Public**
- Check `next.config.js` has `*.supabase.co` in `remotePatterns`

### No products showing
- Go to Supabase Dashboard → Table Editor → products
- Verify sample products were inserted
- Check `is_hidden` column is `false` or `null`

---

Need help? Check the browser console and server terminal for error messages.
