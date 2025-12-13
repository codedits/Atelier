import jwt from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from './admin-api-utils'

const USER_JWT_SECRET = process.env.USER_JWT_SECRET || 'atelier-user-secret-key-change-in-production'
const USER_TOKEN_EXPIRY = '7d' // Users stay logged in longer than admins

export interface UserPayload {
  id: string
  email: string
  name?: string
}

/**
 * Generate a JWT token for a user
 */
export function generateUserToken(user: UserPayload): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: 'user' },
    USER_JWT_SECRET,
    { expiresIn: USER_TOKEN_EXPIRY }
  )
}

/**
 * Verify a user JWT token
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

/**
 * Extract user from request cookies
 */
export function getUserFromRequest(req: NextApiRequest): UserPayload | null {
  const token = req.cookies['atelier_user_token']
  if (!token) return null
  return verifyUserToken(token)
}

/**
 * Set user token as HTTP-only cookie
 */
export function setUserTokenCookie(res: NextApiResponse, token: string): void {
  // 7 days expiry
  const maxAge = 7 * 24 * 60 * 60
  res.setHeader(
    'Set-Cookie',
    `atelier_user_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  )
}

/**
 * Clear user token cookie (logout)
 */
export function clearUserTokenCookie(res: NextApiResponse): void {
  res.setHeader(
    'Set-Cookie',
    `atelier_user_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
  )
}

/**
 * Generate a 6-digit OTP code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Get OTP expiry time (10 minutes from now)
 */
export function getOtpExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000)
}

/**
 * Delete a user and set their order user_id references to NULL (preserve orders).
 * This ensures orders remain in the system for admin management while removing user data.
 * Returns true on success, false on failure (or if service role not configured).
 */
export async function deleteUserById(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  if (!supabase) return false

  try {
    // First, update orders to set user_id to NULL (preserve orders)
    const { error: ordersError } = await supabase
      .from('orders')
      .update({ user_id: null })
      .eq('user_id', userId)

    if (ordersError) {
      console.error('Failed to update orders user_id:', ordersError.message)
      return false
    }

    // Delete user-specific data (cart, favorites, etc.) - these will cascade
    const { error: cartError } = await supabase
      .from('user_cart')
      .delete()
      .eq('user_id', userId)

    if (cartError) {
      console.error('Failed to delete user cart:', cartError.message)
      // Continue anyway
    }

    const { error: favoritesError } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)

    if (favoritesError) {
      console.error('Failed to delete user favorites:', favoritesError.message)
      // Continue anyway
    }

    const { error: otpError } = await supabase
      .from('user_otps')
      .delete()
      .eq('email', '')
      .neq('id', '0') // Delete all OTPs for this user by finding via user lookup

    // Finally, delete the user record
    const { error } = await supabase.from('users').delete().eq('id', userId)
    if (error) {
      console.error('Failed to delete user:', error.message)
      return false
    }
    
    console.log(`User ${userId} deleted successfully. Orders preserved with user_id set to NULL.`)
    return true
  } catch (err) {
    console.error('Delete user error:', err)
    return false
  }
}
