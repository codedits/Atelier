import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

export default withAdminAuth(async (req, res, { client, adminClient }) => {
  if (req.method === 'GET') {
    const { data, error } = await client
      .from('store_settings')
      .select('*')

    if (error) return res.status(500).json({ error: error.message })

    const settings: Record<string, string> = {}
    data?.forEach((s: any) => { settings[s.key] = s.value })

    return res.status(200).json(settings)
  }

  if (req.method === 'PUT') {
    if (!adminClient) {
      return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' })
    }

    const updates = req.body as Record<string, string>
    const errors: string[] = []

    for (const [key, value] of Object.entries(updates)) {
      const { error } = await (adminClient as any)
        .from('store_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

      if (error) errors.push(`${key}: ${error.message}`)
    }

    if (errors.length > 0) {
      return res.status(500).json({ error: `Failed to update: ${errors.join(', ')}` })
    }

    apiCache.invalidateByTag('store_settings')
    invalidateSSGCache('site_config')
    try { await res.revalidate('/') } catch {}

    return res.status(200).json({ message: 'Settings updated' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})
