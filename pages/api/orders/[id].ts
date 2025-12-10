import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Order } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method === 'GET') {
    // Get order by ID (for order tracking)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.status(200).json(data as Order)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
