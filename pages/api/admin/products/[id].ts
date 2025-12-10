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

  const { id } = req.query
  const productId = String(id)
  const client = supabaseAdmin ?? supabase

  if (req.method === 'GET') {
    const { data, error } = await client
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) return res.status(404).json({ error: 'Product not found' })
    return res.status(200).json(data)
  }

  // For writes, require service role to bypass RLS
  if (!supabaseAdmin) {
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

    const { data, error } = await supabaseAdmin
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
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ message: 'Product deleted' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
