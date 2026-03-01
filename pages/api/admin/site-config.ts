import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
}

function getAdminFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyAdminToken(authHeader.substring(7))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const client = supabaseAdmin ?? supabase

  if (req.method === 'GET') {
    const { data, error } = await client
      .from('site_config')
      .select('*')
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'PUT') {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' })
    }

    const { homepage_layout, nav_menu, theme_colors, features } = req.body

    // Find the existing config row ID dynamically instead of using a hardcoded UUID
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('site_config')
      .select('id')
      .single() as { data: any, error: any }

    if (fetchError || !existing) {
      return res.status(500).json({ error: 'site_config row not found' })
    }

    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() }
    if (homepage_layout !== undefined) updatePayload.homepage_layout = homepage_layout
    if (nav_menu !== undefined) updatePayload.nav_menu = nav_menu
    if (theme_colors !== undefined) updatePayload.theme_colors = theme_colors
    if (features !== undefined) updatePayload.features = features

    const { error } = await (supabaseAdmin as any)
      .from('site_config')
      .update(updatePayload)
      .eq('id', existing.id)

    if (error) return res.status(500).json({ error: error.message })

    apiCache.invalidateByTag('site_config')
    invalidateSSGCache('site_config')
    try { await res.revalidate('/') } catch {}

    return res.status(200).json({ message: 'Site config updated' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
