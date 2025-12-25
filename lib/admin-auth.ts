import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'atelier-admin-secret-key-change-in-production'
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
