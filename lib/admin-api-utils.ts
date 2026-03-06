import type { NextApiRequest, NextApiResponse } from 'next'
import type { NextRequest } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { supabase as supabaseAnon } from './supabase'

export interface AdminUser {
  id: string
  username: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Singleton pattern to avoid recreating the client on every request
let supabaseAdminInstance: SupabaseClient | null = null

/**
 * Get the Supabase admin client (with service role key) for write operations.
 * Returns null if SUPABASE_SERVICE_ROLE_KEY is not configured.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null
  }
  
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey)
  }
  
  return supabaseAdminInstance
}

/**
 * Get the appropriate Supabase client for read operations.
 * Returns admin client if available, otherwise falls back to anon client.
 */
export function getSupabaseClient(): SupabaseClient {
  return getSupabaseAdmin() ?? supabaseAnon
}

/**
 * Extract and verify admin token from request headers.
 * Returns the admin payload if valid, null otherwise.
 */
export async function getAdminFromRequest(req: NextApiRequest): Promise<AdminUser | null> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  const { verifyAdminToken } = await import('./admin-auth')
  return verifyAdminToken(authHeader.substring(7))
}

export async function getAdminFromNextRequest(req: NextRequest): Promise<AdminUser | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const { verifyAdminToken } = await import('./admin-auth')
  return verifyAdminToken(authHeader.substring(7))
}

/**
 * Check if service role key is configured (required for write operations).
 */
export function isServiceRoleConfigured(): boolean {
  return !!supabaseServiceRoleKey
}

/**
 * Higher-order handler that centralizes admin auth + Supabase client setup.
 * Eliminates the need for each admin API route to create its own client/auth check.
 * 
 * Usage:
 * ```ts
 * export default withAdminAuth(async (req, res, { admin, client }) => {
 *   // `admin` is verified, `client` is the best available Supabase client
 *   const { data, error } = await client.from('products').select('*')
 *   return res.status(200).json(data)
 * })
 * ```
 */
export function withAdminAuth(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    ctx: { admin: AdminUser; client: SupabaseClient; adminClient: SupabaseClient | null }
  ) => Promise<void | NextApiResponse>,
  options?: {
    /** Return 500 if service role key is missing */
    requireServiceRole?: boolean
    /** HTTP methods that bypass auth (e.g. ['GET'] for public reads) */
    allowPublicMethods?: string[]
  }
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Allow certain methods without auth (public reads)
    if (
      options?.allowPublicMethods &&
      req.method &&
      options.allowPublicMethods.includes(req.method)
    ) {
      const adminClient = getSupabaseAdmin()
      const client = adminClient ?? supabaseAnon
      // Pass a stub admin — handler can check if admin is null-ish for public path
      return handler(req, res, {
        admin: { id: '__public__', username: '__public__' } as AdminUser,
        client,
        adminClient,
      })
    }

    const admin = await getAdminFromRequest(req)
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const adminClient = getSupabaseAdmin()
    const client = adminClient ?? supabaseAnon

    if (options?.requireServiceRole && !adminClient) {
      return res.status(500).json({ error: 'Service role key not configured — write operations unavailable' })
    }

    return handler(req, res, { admin, client, adminClient })
  }
}
