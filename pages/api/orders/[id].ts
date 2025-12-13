import type { NextApiRequest, NextApiResponse } from 'next'
import { Order } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { getUserFromRequest } from '@/lib/user-auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Order ID is required' })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  if (req.method === 'GET') {
    const user = getUserFromRequest(req)
    
    // Get order by ID
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // If order has a user_id, verify the requester owns it
    if (order.user_id) {
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' })
      }
      if (order.user_id !== user.id) {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    return res.status(200).json(order as Order)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
