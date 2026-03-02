import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

export default withAdminAuth(async (req, res, { client, adminClient }) => {
  const { id } = req.query
  const productId = String(id)

  if (req.method === 'GET') {
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) return res.status(404).json({ error: 'Product not found' })
    return res.status(200).json(data)
  }

  if (!adminClient) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  if (req.method === 'PUT') {
    // Update product
    const updates = req.body

    // Remove id from updates if present
    delete updates.id
    delete updates.created_at

    // Convert numeric fields
    if (updates.price !== undefined) updates.price = Number(updates.price)
    if (updates.old_price !== undefined) updates.old_price = updates.old_price ? Number(updates.old_price) : null
    if (updates.stock !== undefined) updates.stock = Number(updates.stock)

    const { data, error } = await adminClient
      .from('products')
      // @ts-ignore - Supabase client without typed schema
      .update(updates)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      console.error('Product update error:', error)
      return res.status(500).json({ error: error.message })
    }
    apiCache.invalidateByTag('products')
    invalidateSSGCache('products')
    try {
      await res.revalidate('/')
      await res.revalidate('/products')
    } catch (e) {
      console.warn('Failed to revalidate', e)
    }
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { error } = await adminClient
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) return res.status(500).json({ error: error.message })
    apiCache.invalidateByTag('products')
    invalidateSSGCache('products')
    try {
      await res.revalidate('/')
      await res.revalidate('/products')
    } catch (e) {
      console.warn('Failed to revalidate', e)
    }
    return res.status(200).json({ message: 'Product deleted' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
})
