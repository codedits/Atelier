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
- 📊 Dashboard with analytics
- 🖼️ **Image upload to Supabase Storage**

### Dynamic Content System
- 🎪 Hero carousel with custom images and CTAs
- 📸 Product images stored in Supabase
- 🎨 Featured collections manager (coming soon)
- 💬 Testimonials manager (coming soon)
- ⚙️ Homepage sections editor (coming soon)

## Setup Guide

### Basic Setup
```powershell
npm install
cp .env.example .env.local  # Add your Supabase credentials
npm run dev
```

### Dynamic Content Setup (Required for Image Uploads)
**📖 See [DYNAMIC_CONTENT_SETUP.md](./DYNAMIC_CONTENT_SETUP.md) for complete instructions**

Quick checklist:
1. ✅ Execute `lib/supabase-dynamic-content-schema.sql` in Supabase SQL Editor
2. ✅ Create Storage buckets: `product-images`, `hero-images`, `collection-images`
3. ✅ Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
4. ✅ Restart dev server

## Admin Access

Default URL: http://localhost:3000/admin

**Important:** You need to create an admin user in your Supabase database. See the [setup guide](./DYNAMIC_CONTENT_SETUP.md) for instructions.
