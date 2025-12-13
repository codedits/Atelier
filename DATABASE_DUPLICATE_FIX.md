# Database Duplicate Data - Fix Instructions

## What Happened?
The COMPLETE_SUPABASE_SETUP.sql script was missing proper `ON CONFLICT` clauses with unique column specifications, so if you ran it multiple times, it created duplicate records.

## ✅ Fixed
We've updated the SQL script with:
1. **Added UNIQUE constraints** to product names, hero image titles, collection titles, and customer names
2. **Proper ON CONFLICT handling** for all INSERT statements
3. **Created a cleanup script** to remove existing duplicates

## How to Fix Your Database

### Step 1: Clean Up Duplicates
1. Open Supabase Dashboard → SQL Editor
2. Copy all SQL from [CLEANUP_DUPLICATES.sql](CLEANUP_DUPLICATES.sql)
3. Paste and run it
4. Check the verification results at the bottom

Expected counts after cleanup:
- Categories: 5
- Products: 5
- Hero Images: 1
- Featured Collections: 4
- Testimonials: 3
- Homepage Sections: 2

### Step 2: Run Updated Setup (Safe Now)
The updated [COMPLETE_SUPABASE_SETUP.sql](COMPLETE_SUPABASE_SETUP.sql) can now be safely run multiple times without creating duplicates.

## Files Updated
- **COMPLETE_SUPABASE_SETUP.sql** - Added unique constraints and proper ON CONFLICT clauses
- **CLEANUP_DUPLICATES.sql** - New script to remove existing duplicates

## What Changed in the Script

### Before (Vulnerable to duplicates):
```sql
INSERT INTO products (...) VALUES (...) ON CONFLICT DO NOTHING;
```

### After (Safe):
```sql
INSERT INTO products (name, ...) VALUES (...) ON CONFLICT (name) DO NOTHING;
```

This ensures the database prevents duplicates at the constraint level.

## Prevention Going Forward
The script is now **idempotent** - you can run it multiple times safely without creating duplicates. This is best practice for database setup scripts.
