import jwt from 'jsonwebtoken'

const isProduction = process.env.NODE_ENV === 'production'
if (isProduction && !process.env.USER_JWT_SECRET) {
  throw new Error('USER_JWT_SECRET environment variable is required in production')
}

const USER_JWT_SECRET = process.env.USER_JWT_SECRET || 'atelier-user-secret-key-change-in-production'

export interface UserPayload {
  id: string
  email: string
  name?: string
}

/**
 * Verify a user JWT token — lightweight, no admin dependencies.
 * Safe to use in getServerSideProps without pulling in admin modules.
 */
export function verifyUserToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, USER_JWT_SECRET) as UserPayload & { role: string }
    if (decoded.role !== 'user') return null
    return { id: decoded.id, email: decoded.email, name: decoded.name }
  } catch {
    return null
  }
}
