import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

export default withAdminAuth(async (req, res, { client, adminClient }) => {
  if (req.method === 'GET') {
    const { data, error } = await client
      .from('site_config')
      .select('*')
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'PUT') {
    if (!adminClient) {
      return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' })
    }

    const { homepage_layout, nav_menu, theme_colors, features } = req.body

    // Find the existing config row ID dynamically instead of using a hardcoded UUID
    const { data: existing, error: fetchError } = await adminClient
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

    const { error } = await (adminClient as any)
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
})
