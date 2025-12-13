# Admin Panel Documentation

## Overview
This application includes a comprehensive admin panel for managing products, orders, categories, and site content. The admin system is separate from the customer authentication system.

## Admin Authentication

### Development Mode
- **DEV UNLOCK**: Set `NEXT_PUBLIC_ADMIN_UNLOCK=true` in your `.env.local` to bypass login during development
- **DEV NO AUTH**: Set `ADMIN_NO_AUTH=true` for backend API bypass during development

### Production Mode
- Admin users are stored in the `admin_users` table in Supabase
- Password authentication with bcrypt hashing
- OTP (One-Time Password) login system available
- JWT tokens for session management (8-hour expiry)

## Admin Features

### 🛍️ Order Management
- **View Orders**: Complete order details, customer info, items
- **Update Status**: Change order status (pending → shipped → delivered)
- **Update Payment**: Mark payments as paid/pending
- **Remove Orders**: ⚠️ **PERMANENT DELETION** - Admin can remove any order completely
  - Restores inventory automatically
  - Cannot be undone
  - Use for cleanup/data management

### 📦 Product Management
- Create, edit, delete products
- Manage stock levels
- Upload product images
- Category assignment

### 🏷️ Category Management
- Create and manage product categories
- Hierarchical category structure

### 🏠 Homepage Management
- **Hero Images**: Manage banner/slider images
- **Featured Collections**: Highlight specific product collections
- **Testimonials**: Customer review management

### 📊 Dashboard
- Order statistics
- Revenue tracking
- Quick action buttons

## Important Distinctions

### ⚠️ Order Cancellation vs Removal
**Customer Cancellation** (`/api/orders/cancel`):
- Soft or hard delete based on business rules
- May preserve order for compliance
- Triggers customer notifications

**Admin Removal** (`/api/admin/orders/[id]` DELETE):
- Always permanent database deletion
- Inventory restoration
- For data cleanup only
- No customer notification

## Database Schema Requirements

### Required Tables
```sql
-- Admin users
admin_users (id, username, password_hash, created_at)

-- Admin actions logging
admin_actions (id, admin_email, action, target_id, details, created_at)

-- Products with stock management
products (id, name, price, stock, ...)

-- Orders with status tracking
orders (id, status: 'pending'|'shipped'|'delivered'|'cancelled', ...)
```

## Environment Variables

### Required for Production
```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Authentication
JWT_SECRET=your_secure_jwt_secret
ADMIN_EMAIL_FROM=your_email
ADMIN_EMAIL_API_KEY=your_email_api_key

# OTP System
OTP_EXPIRY_MINUTES=10
```

### Optional for Development
```env
# Skip admin login (DEV ONLY)
NEXT_PUBLIC_ADMIN_UNLOCK=true
ADMIN_NO_AUTH=true
```

## Security Considerations

### 🔒 Production Security
1. **Never** set `NEXT_PUBLIC_ADMIN_UNLOCK=true` in production
2. Use strong JWT secrets (256-bit recommended)
3. Admin users should have strong passwords
4. Consider IP allowlisting for admin access

### 🔑 Authentication Flow
1. Admin enters username/password OR requests OTP
2. Backend verifies credentials or generates OTP
3. JWT token issued with 8-hour expiry
4. Token required for all admin API calls

## API Structure

### Admin API Routes
```
/api/admin/
├── login.ts              # Password authentication
├── generate-otp.ts       # OTP generation
├── login-otp.ts          # OTP login
├── verify.ts             # Token verification
├── dashboard.ts          # Analytics
├── settings.ts           # Site settings
├── upload.ts             # File uploads
├── orders/
│   ├── index.ts          # List/create orders
│   └── [id].ts           # View/update/DELETE orders
├── products/
│   ├── index.ts          # List/create products
│   └── [id].ts           # View/update/delete products
└── categories/
    ├── index.ts          # List/create categories
    └── [id].ts           # View/update/delete categories
```

## Known Limitations

### 🚨 Potential Confusion Points

1. **Unused Components**: 
   - `AdminOrderCancelModal.tsx` exists but is not used
   - Was replaced with simple confirmation dialog
   - Safe to delete if not needed

2. **Two Order Systems**:
   - Customer order cancellation vs admin order removal
   - Different APIs with different behaviors
   - Admin removal is permanent, customer cancellation may preserve

3. **Development vs Production**:
   - Development unlock bypasses security
   - OTP system may need email configuration
   - JWT secrets must be production-ready

4. **Stock Management**:
   - Admin order removal restores inventory
   - Customer cancellation may or may not restore inventory
   - Check business logic for your use case

## Troubleshooting

### Common Issues
1. **Admin can't login**: Check `admin_users` table exists and has valid data
2. **Token expires quickly**: Increase `TOKEN_EXPIRY` in `admin-auth.ts`
3. **OTP not working**: Verify email configuration and API keys
4. **Orders not deleting**: Check foreign key constraints in database

### Debug Mode
Enable development mode with:
```env
NEXT_PUBLIC_ADMIN_UNLOCK=true
ADMIN_NO_AUTH=true
```

## File Structure
```
pages/admin/           # Admin page components
├── index.tsx         # Admin dashboard
├── orders.tsx        # Order management
├── products.tsx      # Product management
└── ...

pages/api/admin/      # Admin API endpoints
├── login.ts
├── orders/
└── ...

components/admin/     # Admin UI components
├── AdminLayout.tsx   # Main layout
└── ...

context/
├── AdminAuthContext.tsx  # Admin authentication
└── ...

lib/
├── admin-auth.ts     # Authentication logic
├── admin-api-utils.ts # API utilities
└── ...
```

## Deployment Notes
1. Ensure all required environment variables are set
2. Database tables must be created before first use
3. Create initial admin user in `admin_users` table
4. Test admin functionality in staging environment
5. Never deploy with development unlock enabled