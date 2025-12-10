import { supabase } from './supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'atelier-admin-secret-key-change-in-production'
const TOKEN_EXPIRY = '8h'

const DEV_NO_AUTH = process.env.ADMIN_NO_AUTH === 'true'

export interface AdminUser {
  id: string
  username: string
}

export async function verifyAdminCredentials(username: string, password: string): Promise<AdminUser | null> {
  // If running in dev mode with ADMIN_NO_AUTH=true, bypass credential checks
  if (DEV_NO_AUTH) {
    return { id: 'dev-admin', username }
  }
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username, password_hash')
    .eq('username', username)
    .single()

  if (error || !data) {
    return null
  }

  // Verify password against stored bcrypt hash
  const isValidPassword = await bcrypt.compare(password, data.password_hash)
  
  if (!isValidPassword) {
    return null
  }

  return { id: data.id, username: data.username }
}

export function generateAdminToken(admin: AdminUser): string {
  return jwt.sign(
    { id: admin.id, username: admin.username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  )
}

export function verifyAdminToken(token: string): AdminUser | null {
  // In dev "no auth" mode accept any token and return a dev admin
  if (DEV_NO_AUTH) {
    return { id: 'dev-admin', username: 'admin' }
  }

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
