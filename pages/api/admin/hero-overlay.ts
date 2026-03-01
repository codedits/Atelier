import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '../../../lib/admin-auth'
import { supabase as supabaseAnon } from '@/lib/supabase'
import { invalidateSSGCache } from '@/lib/cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
}

function getAdminFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyAdminToken(authHeader.substring(7))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - public read
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAnon
        .from('site_config')
        .select('features')
        .limit(1)
        .single()
      if (error) throw error
      return res.status(200).json(data?.features?.hero?.overlay || {})
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  // PUT - admin only
  const admin = getAdminFromRequest(req)
  if (!admin) return res.status(401).json({ error: 'Unauthorized' })
  if (!supabaseAdmin) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' })

  if (req.method === 'PUT') {
    try {
      const { color, opacity, gradient_from, gradient_to, gradient_enabled } = req.body

      // First get current features
      const { data: current } = await supabaseAdmin
        .from('site_config')
        .select('id, features')
        .limit(1)
        .single() as { data: any }

      if (!current) return res.status(404).json({ error: 'No site_config found' })

      const features = current.features || {}
      features.hero = features.hero || {}
      features.hero.overlay = {
        color: color || '#000000',
        opacity: opacity ?? 40,
        gradient_from: gradient_from ?? 60,
        gradient_to: gradient_to ?? 20,
        gradient_enabled: gradient_enabled !== false,
      }

      const { error } = await (supabaseAdmin as any)
        .from('site_config')
        .update({ features })
        .eq('id', current.id)

      if (error) throw error

      invalidateSSGCache('site_config')
      try { await res.revalidate('/') } catch {}
      return res.status(200).json(features.hero.overlay)
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
