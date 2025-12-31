import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// In production, these MUST be set in environment variables
// Development fallbacks are provided for local testing only
const isProduction = process.env.NODE_ENV === 'production'

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production')
}
if (isProduction && !process.env.ADMIN_PASSWORD_HASH) {
  throw new Error('ADMIN_PASSWORD_HASH environment variable is required in production')
}

// Use env vars in production, fallbacks only in development
const JWT_SECRET = process.env.JWT_SECRET || 'dev-admin-secret-key-DO-NOT-USE-IN-PRODUCTION'
const TOKEN_EXPIRY = '8h'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$uKMB5ZY2uNNLEP30QmCnQeyuWllZKxRyL1rnAeii86v5Paue8TDie'

export interface AdminUser {
  id: string
  username: string
}

export async function verifyAdminCredentials(username: string, password: string): Promise<AdminUser | null> {
  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  if (isValid) {
    return { id: 'admin', username: 'Admin' }
  }
  return null
}

export function generateAdminToken(admin: AdminUser): string {
  return jwt.sign(
    { id: admin.id, username: admin.username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  )
}

export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser & { role: string }
    if (decoded.role !== 'admin') return null
    return { id: decoded.id, username: decoded.username }
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}
