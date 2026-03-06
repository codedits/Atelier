import jwt from 'jsonwebtoken'

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
  if (process.env.NODE_ENV === 'production' && !process.env.USER_JWT_SECRET) {
    // During production build, we might not have the secret but we shouldn't crash
    // if this is called. However, verifyUserToken shouldn't be called during build.
    // We'll just return null or throw if it's strictly required.
    // For verification, it's safer to return null if the secret is missing.
    return null
  }
  try {
    const decoded = jwt.verify(token, USER_JWT_SECRET) as UserPayload & { role: string }
    if (decoded.role !== 'user') return null
    return { id: decoded.id, email: decoded.email, name: decoded.name }
  } catch {
    return null
  }
}
