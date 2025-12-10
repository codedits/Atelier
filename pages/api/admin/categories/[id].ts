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
  const categoryId = String(id)
  const client = supabaseAdmin ?? supabase

  if (req.method === 'GET') {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (error) return res.status(404).json({ error: 'Category not found' })
    return res.status(200).json(data)
  }

  // Require service role for write operations
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  if (req.method === 'PUT') {
    const { name } = req.body

    const { data, error } = await supabaseAdmin
      .from('categories')
      // @ts-ignore - Supabase client without typed schema
      .update({ name })
      .eq('id', categoryId)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ message: 'Category deleted' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
