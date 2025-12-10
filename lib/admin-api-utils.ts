import type { NextApiRequest } from 'next'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { verifyAdminToken } from './admin-auth'
import { supabase as supabaseAnon } from './supabase'

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
export function getAdminFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyAdminToken(authHeader.substring(7))
}

/**
 * Check if service role key is configured (required for write operations).
 */
export function isServiceRoleConfigured(): boolean {
  return !!supabaseServiceRoleKey
}
