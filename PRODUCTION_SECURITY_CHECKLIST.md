# 🔒 Production Security Checklist for Atelier

## ✅ COMPLETED (by this assistant)
- [x] Added security headers to Next.js config
- [x] Created rate limiting utility
- [x] Created input validation utility
- [x] Created production environment template

## ⚠️ CRITICAL - DO BEFORE DEPLOYMENT

### 1. Environment Variables
- [ ] **Fix SUPABASE_SERVICE_ROLE_KEY**
  - Go to: https://supabase.com/dashboard/project/ctiwaclyvidudekvvizs/settings/api
  - Copy the full **service_role** key (long JWT token)
  - Update in Vercel environment variables

- [ ] **Secure Email Credentials**
  - Remove `SMTP_USER` and `SMTP_PASS` from `.env.local`
  - Add them in Vercel → Settings → Environment Variables
  - Mark as "Production" only
  - **NEVER commit these to git**

- [ ] **Verify .env.local is in .gitignore**
  ```bash
  git rm --cached .env.local
  git commit -m "Remove .env.local from git"
  ```

### 2. Vercel Configuration
Go to: https://vercel.com/dashboard → Your Project → Settings

#### Environment Variables to Add:
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://ctiwaclyvidudekvvizs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aXdhY2x5dmlkdWRla3Z2aXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTA1OTMsImV4cCI6MjA4MDQyNjU5M30.yyoGygRDr9xylMitcMs87pmmBSSyR8hQjetQGUWwcs0
SUPABASE_SERVICE_ROLE_KEY=[FULL JWT FROM SUPABASE]
JWT_SECRET=w2X/lq4u60KPvWS8QWhokStyfnjlTJzcL1ndtLxnpss=
USER_JWT_SECRET=f5xNiGmzXn0WG7f7A1M/bYeopw66vEDFQ+3gn5KRR1M=
ADMIN_PASSWORD_HASH=$2b$10$uKMB5ZY2uNNLEP30QmCnQeyuWllZKxRyL1rnAeii86v5Paue8TDie
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=talhahamza357@gmail.com
SMTP_PASS=qsvx oymo pbjf gbaz
SMTP_FROM=Atelier <no-reply@yourdomain.com>
SMTP_SECURE=false
```

**Important:** Mark as "Production" environment only

### 3. Supabase Security

#### Row Level Security (RLS)
- [ ] Enable RLS on all tables
  ```sql
  -- Run in Supabase SQL Editor
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  -- Repeat for all tables
  ```

- [ ] **Create RLS policies for public access:**
  ```sql
  -- Products (read-only for public)
  CREATE POLICY "Public can view published products"
    ON products FOR SELECT
    USING (status = 'published');

  -- Reviews (read-only for public)
  CREATE POLICY "Public can view approved reviews"
    ON reviews FOR SELECT
    USING (status = 'approved');
  ```

- [ ] **Create RLS policies for authenticated users:**
  ```sql
  -- Orders (users can only see their own)
  CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can create own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  ```

#### Supabase Auth Settings
- [ ] Go to Authentication → Settings
- [ ] Set **Site URL**: `https://your-domain.com`
- [ ] Add **Redirect URLs**: `https://your-domain.com/**`
- [ ] Enable **Email confirmations** (recommended)
- [ ] Set **JWT expiry**: 3600 seconds (1 hour)

### 4. Database Security
- [ ] **Remove test/dummy data from production database**
- [ ] **Backup database before deployment**
  - Supabase → Database → Backups → Enable PITR
- [ ] **Verify no SQL injection vulnerabilities**
  - Use parameterized queries only
  - Use Supabase client methods (they handle this automatically)

### 5. API Routes Security

#### Add rate limiting to sensitive endpoints:

**Example for login endpoint** (`pages/api/auth/login.ts`):
```typescript
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 attempts
})

export default async function handler(req, res) {
  const ip = getClientIp(req)
  const { success } = limiter.check(ip)
  
  if (!success) {
    return res.status(429).json({ error: 'Too many attempts' })
  }
  // ... rest of handler
}
```

**Apply to these endpoints:**
- [ ] `/api/auth/login` (5 requests per 15 min)
- [ ] `/api/auth/register` (3 requests per hour)
- [ ] `/api/admin/auth/verify-otp` (10 requests per 15 min)
- [ ] `/api/orders` (POST: 10 requests per hour)
- [ ] `/api/reviews` (POST: 5 requests per hour)

### 6. HTTPS & Domain
- [ ] **Configure custom domain in Vercel**
  - Vercel auto-provisions SSL certificates
  - Forces HTTPS automatically
- [ ] **Update CORS if needed** (Next.js handles this by default)

### 7. Error Handling
- [ ] **Never expose stack traces in production**
  - Verify `removeConsole: true` in next.config.js (✅ already set)
- [ ] **Use generic error messages for auth failures**
  - Instead of "User not found" → "Invalid credentials"
  - Instead of "Wrong password" → "Invalid credentials"

### 8. Monitoring & Logging
- [ ] **Set up Vercel Analytics**
  - Vercel Dashboard → Analytics tab
- [ ] **Set up error tracking** (optional but recommended)
  - Sentry: `npm install @sentry/nextjs`
  - Or LogRocket, Rollbar, etc.

### 9. Content Security Policy (Advanced - Optional)
If you want to add CSP headers, add to next.config.js:
```javascript
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://ctiwaclyvidudekvvizs.supabase.co"
}
```

### 10. Final Checks
- [ ] **Test all API endpoints in production**
- [ ] **Verify admin panel requires authentication**
- [ ] **Test payment flows end-to-end**
- [ ] **Verify email notifications work**
- [ ] **Check all image uploads work**
- [ ] **Test on mobile devices**
- [ ] **Run Lighthouse audit**
  - Open Chrome DevTools → Lighthouse
  - Run audit on production URL
  - Fix any security warnings

## 🚀 Deployment Command
```bash
# Build locally to check for errors
npm run build

# Deploy to Vercel
git push origin main
```

## 📊 Post-Deployment Monitoring

### Week 1 Checklist:
- [ ] Monitor error rates in Vercel logs
- [ ] Check Supabase database usage
- [ ] Verify email delivery rates
- [ ] Review failed login attempts
- [ ] Check API response times

### Security Maintenance:
- [ ] Review Supabase logs weekly
- [ ] Update dependencies monthly: `npm audit fix`
- [ ] Rotate JWT secrets every 6 months
- [ ] Review RLS policies quarterly

## 🆘 Emergency Contacts
- Vercel Support: https://vercel.com/help
- Supabase Support: https://supabase.com/dashboard/support
- Your Domain Registrar
- Your Email Provider (Gmail)

## 📝 Notes
- All passwords and secrets are already secure (bcrypt hashed)
- JWT secrets are strong (base64 encoded)
- Don't change existing hashes or secrets unless compromised
- Keep this checklist updated as you add new features
