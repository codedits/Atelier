import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'

export default withAdminAuth(async (req, res, { client, adminClient }) => {
  // GET - Public
  if (req.method === 'GET') {
    try {
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

  if (!adminClient) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })

  if (req.method === 'PUT') {
    try {
      const { section_key, title, subtitle, content, image_url, cta_text, cta_link, metadata, is_active } = req.body

      if (!section_key) {
        return res.status(400).json({ error: 'section_key is required' })
      }

      const upsertData: any = {
        section_key,
        title,
        subtitle,
        content,
        image_url,
        cta_text,
        cta_link,
        is_active: is_active !== undefined ? is_active : true
      }
      if (metadata !== undefined) {
        upsertData.metadata = metadata
      }

      const { data, error } = await (adminClient as any)
        .from('homepage_sections')
        .upsert(upsertData, { onConflict: 'section_key' })
        .select()
        .single()

      if (error) throw error

      // Bust caches
      const { invalidateSSGCache } = await import('@/lib/cache')
      invalidateSSGCache('homepage_sections')
      try { await res.revalidate('/') } catch {}

      return res.status(200).json(data)
    } catch (err: any) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}, { allowPublicMethods: ['GET'] })
