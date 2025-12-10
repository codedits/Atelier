import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
}

// Middleware to check admin auth
function getAdminFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyAdminToken(authHeader.substring(7))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    // Get all products (including hidden) for admin - use service role to bypass RLS
    const client = supabaseAdmin ?? supabase
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    // Require service role for writes to bypass RLS
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
    }
    // Create new product
    const { name, description, price, old_price, category, gender, image_url, images, stock, is_hidden } = req.body

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

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData] as any)
      .select()
      .single()

    if (error) {
      console.error('Product creation error:', error)
      return res.status(500).json({ error: error.message })
    }
    return res.status(201).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
