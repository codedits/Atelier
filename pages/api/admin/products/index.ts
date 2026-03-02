import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

export default withAdminAuth(async (req, res, { client, adminClient }) => {
  if (req.method === 'GET') {
    // Get all products (including hidden) for admin - use service role to bypass RLS
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    if (!adminClient) {
      return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
    }
    // Create new product
    const { name, description, price, old_price, category, gender, image_url, images, stock, is_hidden, is_featured } = req.body

    if (!name || !description || price === undefined || !category || !gender || !image_url) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const productData: any = {
      name,
      description,
      price: Number(price),
      old_price: old_price ? Number(old_price) : null,
      category,
      gender,
      image_url,
      images: images || [],
      stock: Number(stock) || 0,
    }

    // Only add is_hidden if it exists in the database (requires admin schema)
    if (is_hidden !== undefined) {
      productData.is_hidden = is_hidden
    }
    if (is_featured !== undefined) {
      productData.is_featured = is_featured
    }

    const { data, error } = await adminClient
      .from('products')
      .insert([productData] as any)
      .select()
      .single()

    if (error) {
      console.error('Product creation error:', error)
      return res.status(500).json({ error: error.message })
    }
    // Bust the frontend cache so the homepage new arrivals section regenerates
    apiCache.invalidateByTag('products')
    invalidateSSGCache('products')
    try {
      await res.revalidate('/')
      await res.revalidate('/products')
    } catch (e) {
      console.warn('Failed to revalidate', e)
    }
    return res.status(201).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
})
