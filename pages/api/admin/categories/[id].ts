import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

export default withAdminAuth(async (req, res, { client, adminClient }) => {
  const { id } = req.query
  const categoryId = String(id)

  if (req.method === 'GET') {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (error) return res.status(404).json({ error: 'Category not found' })
    return res.status(200).json(data)
  }

  if (!adminClient) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  if (req.method === 'PUT') {
    const { name } = req.body

    const { data, error } = await adminClient
      .from('categories')
      // @ts-ignore - Supabase client without typed schema
      .update({ name })
      .eq('id', categoryId)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    apiCache.invalidateByTag('categories')
    invalidateSSGCache('categories')
    try { await res.revalidate('/') } catch {}
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { error } = await adminClient
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) return res.status(500).json({ error: error.message })
    apiCache.invalidateByTag('categories')
    invalidateSSGCache('categories')
    try { await res.revalidate('/') } catch {}
    return res.status(200).json({ message: 'Category deleted' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})
