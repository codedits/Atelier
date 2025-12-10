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
  const orderId = String(id)
  const client = supabaseAdmin ?? supabase

  if (req.method === 'GET') {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) return res.status(404).json({ error: 'Order not found' })
    return res.status(200).json(data)
  }

  // Require service role for writes
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  if (req.method === 'PUT') {
    const { status, payment_status } = req.body
    const updates: Record<string, string> = {}

    if (status) updates.status = status
    if (payment_status) updates.payment_status = payment_status

    const { data, error } = await supabaseAdmin
      .from('orders')
      // @ts-ignore - Supabase client without typed schema
      .update(updates)
      .eq('id', orderId)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
