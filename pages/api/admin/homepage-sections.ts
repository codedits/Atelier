import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '../../../lib/admin-auth'
import { supabase as supabaseAnon } from '@/lib/supabase'

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
  // GET - Public, others require admin auth
  if (req.method === 'GET') {
    try {
      const client = supabaseAdmin ?? supabaseAnon
      const { data, error } = await client
        .from('homepage_sections')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      return res.status(200).json(data || [])
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  const admin = getAdminFromRequest(req)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  if (req.method === 'PUT') {
    try {
      const { section_key, title, subtitle, content, image_url, cta_text, cta_link, is_active } = req.body

      if (!section_key) {
        return res.status(400).json({ error: 'section_key is required' })
      }

      const { data, error } = await supabaseAdmin
        .from('homepage_sections')
        .upsert({
          section_key,
          title,
          subtitle,
          content,
          image_url,
          cta_text,
          cta_link,
          is_active: is_active !== undefined ? is_active : true
        } as any)
        .select()
        .single()

      if (error) throw error
      return res.status(200).json(data)
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
