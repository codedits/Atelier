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
  // GET - public
  if (req.method === 'GET') {
    try {
      const client = (supabaseAdmin ?? supabaseAnon) as any
      const { data, error } = await client
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (error) throw error
      return res.status(200).json(data || [])
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  // Auth required for mutations
  const admin = getAdminFromRequest(req)
  if (!admin) return res.status(401).json({ error: 'Unauthorized' })
  if (!supabaseAdmin) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' })

  const db = supabaseAdmin as any

  if (req.method === 'POST') {
    try {
      const { text, link, link_text, icon, display_order, is_active } = req.body
      if (!text) return res.status(400).json({ error: 'text is required' })

      const { data, error } = await db
        .from('announcements')
        .insert([{ text, link, link_text, icon: icon || 'sparkle', display_order: display_order || 0, is_active: is_active !== false }])
        .select()
        .single()
      if (error) throw error

      invalidateSSGCache('announcements')
      try { await res.revalidate('/') } catch {}
      return res.status(201).json(data)
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body
      if (!id) return res.status(400).json({ error: 'id is required' })

      const { data, error } = await db
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      invalidateSSGCache('announcements')
      try { await res.revalidate('/') } catch {}
      return res.status(200).json(data)
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id as string
      if (!id) return res.status(400).json({ error: 'id query param required' })

      const { error } = await db
        .from('announcements')
        .delete()
        .eq('id', id)
      if (error) throw error

      invalidateSSGCache('announcements')
      try { await res.revalidate('/') } catch {}
      return res.status(200).json({ success: true })
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
