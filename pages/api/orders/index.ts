import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Order, OrderItem } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Create a new order
    const { user_name, phone, address, items, total_price, payment_method } = req.body

    // Validate required fields
    if (!user_name || !phone || !address || !items || !total_price || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' })
    }

    const newOrder = {
      user_name,
      phone,
      address,
      items: items as OrderItem[],
      total_price: Number(total_price),
      payment_method,
      payment_status: 'pending',
      status: 'pending',
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(201).json(data as Order)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
