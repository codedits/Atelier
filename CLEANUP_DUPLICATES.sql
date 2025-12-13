-- ============================================
-- CLEANUP DUPLICATES SCRIPT
-- ============================================
-- Run this script to remove duplicate data from your database
-- This is safe to run if you only have the sample data

-- Remove duplicate categories (keep first, delete rest)
DELETE FROM categories 
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id FROM categories 
  ORDER BY name, created_at ASC
);

-- Remove duplicate products (keep first by creation date)
DELETE FROM products 
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id FROM products 
  ORDER BY name, created_at ASC
);

-- Remove duplicate hero images (keep first by creation date)
DELETE FROM hero_images 
WHERE id NOT IN (
  SELECT DISTINCT ON (title) id FROM hero_images 
  ORDER BY title, created_at ASC
);

-- Remove duplicate featured collections (keep first by creation date)
DELETE FROM featured_collections 
WHERE id NOT IN (
  SELECT DISTINCT ON (title) id FROM featured_collections 
  ORDER BY title, created_at ASC
);

-- Remove duplicate testimonials (keep first by creation date)
DELETE FROM testimonials 
WHERE id NOT IN (
  SELECT DISTINCT ON (customer_name) id FROM testimonials 
  ORDER BY customer_name, created_at ASC
);

-- Remove duplicate homepage sections (keep by section_key)
DELETE FROM homepage_sections 
WHERE id NOT IN (
  SELECT DISTINCT ON (section_key) id FROM homepage_sections 
  ORDER BY section_key, created_at ASC
);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these SELECT statements to verify cleanup:

SELECT 'Categories Count:' as check, COUNT(*) FROM categories;
SELECT 'Products Count:' as check, COUNT(*) FROM products;
SELECT 'Hero Images Count:' as check, COUNT(*) FROM hero_images;
SELECT 'Featured Collections Count:' as check, COUNT(*) FROM featured_collections;
SELECT 'Testimonials Count:' as check, COUNT(*) FROM testimonials;
SELECT 'Homepage Sections Count:' as check, COUNT(*) FROM homepage_sections;

-- Expected counts:
-- Categories: 5
-- Products: 5
-- Hero Images: 1
-- Featured Collections: 4
-- Testimonials: 3
-- Homepage Sections: 2
