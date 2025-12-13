import type { NextApiRequest, NextApiResponse } from 'next'
import { Favorite, Product } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { supabase as supabaseAnon } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/user-auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseAdmin = getSupabaseAdmin()
  const supabase = supabaseAdmin || supabaseAnon
  const user = getUserFromRequest(req)

  if (req.method === 'GET') {
    // If user is authenticated, get user favorites
    if (user) {
      const { data: favorites, error } = await supabase
        .from('user_favorites')
        .select(`
          id,
          product:products (*)
        `)
        .eq('user_id', user.id)

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      const products = (favorites || [])
        .map((f: any) => f.product)
        .filter((p: any) => p && !p.is_hidden)

      return res.status(200).json(products as Product[])
    }

    // Fallback to client_token for non-authenticated users
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
      .eq('is_hidden', false)

    if (prodError) {
      return res.status(500).json({ error: prodError.message })
    }

    return res.status(200).json(products as Product[])
  }

  if (req.method === 'POST') {
    const { product_id, client_token } = req.body

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' })
    }

    // If user is authenticated, use user_favorites
    if (user && supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from('user_favorites')
        .select('id')
        .eq('product_id', product_id)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        return res.status(200).json({ success: true, message: 'Already in favorites' })
      }

      const { error } = await supabaseAdmin
        .from('user_favorites')
        .insert([{ product_id, user_id: user.id }])

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      return res.status(201).json({ success: true, message: 'Added to favorites' })
    }

    // Fallback to client_token for non-authenticated users
    if (!client_token) {
      return res.status(400).json({ error: 'client_token is required for non-authenticated users' })
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('product_id', product_id)
      .eq('client_token', client_token)
      .single()

    if (existing) {
      return res.status(200).json({ success: true, message: 'Already in favorites' })
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
    const { product_id, client_token } = req.body

    if (!product_id) {
      return res.status(400).json({ error: 'product_id is required' })
    }

    // If user is authenticated, use user_favorites
    if (user && supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('user_favorites')
        .delete()
        .eq('product_id', product_id)
        .eq('user_id', user.id)

      if (error) {
        return res.status(500).json({ error: error.message })
      }

      return res.status(200).json({ success: true, message: 'Removed from favorites' })
    }

    // Fallback to client_token
    if (!client_token) {
      return res.status(400).json({ error: 'client_token is required for non-authenticated users' })
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('product_id', product_id)
      .eq('client_token', client_token)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, message: 'Removed from favorites' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
