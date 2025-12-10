import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Favorite, Product } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Get favorites by client token
    const { client_token } = req.query

    if (!client_token) {
      return res.status(400).json({ error: 'client_token is required' })
    }

    // Get favorite product IDs
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('client_token', client_token)

    if (favError) {
      return res.status(500).json({ error: favError.message })
    }

    if (!favorites || favorites.length === 0) {
      return res.status(200).json([])
    }

    // Get full product details
    const productIds = favorites.map((f) => f.product_id)
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (prodError) {
      return res.status(500).json({ error: prodError.message })
    }

    return res.status(200).json(products as Product[])
  }

  if (req.method === 'POST') {
    // Add a product to favorites
    const { product_id, client_token } = req.body

    if (!product_id || !client_token) {
      return res.status(400).json({ error: 'product_id and client_token are required' })
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('product_id', product_id)
      .eq('client_token', client_token)
      .single()

    if (existing) {
      return res.status(200).json({ message: 'Already in favorites' })
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert([{ product_id, client_token }])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json(data as Favorite)
  }

  if (req.method === 'DELETE') {
    // Remove from favorites
    const { product_id, client_token } = req.body

    if (!product_id || !client_token) {
      return res.status(400).json({ error: 'product_id and client_token are required' })
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('product_id', product_id)
      .eq('client_token', client_token)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ message: 'Removed from favorites' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
