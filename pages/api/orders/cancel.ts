import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getUserFromRequest } from '@/lib/user-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify authentication
    const user = getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { orderId } = req.body

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' })
    }

    // Fetch the order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' })
    }

    // Check if order is within 2 days
    const orderDate = new Date(order.created_at)
    const currentDate = new Date()
    const timeDifference = currentDate.getTime() - orderDate.getTime()
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24)

    if (daysDifference >= 2) {
      return res.status(400).json({ error: 'Orders can only be cancelled within 2 days of placement' })
    }

    // Check if order is already shipped
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ error: 'Order cannot be cancelled after it has been shipped' })
    }

    // Restore product inventory if it was decremented
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.product_id) {
          // Increment the stock back
          const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single()

          if (product) {
            await supabase
              .from('products')
              .update({ stock: (product.stock || 0) + item.quantity })
              .eq('id', item.product_id)
          }
        }
      }
    }

    // Delete the order completely instead of just updating status
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting order:', deleteError)
      return res.status(500).json({ error: 'Failed to cancel order' })
    }

    res.status(200).json({ message: 'Order cancelled and removed successfully' })
  } catch (error) {
    console.error('Error in cancel order handler:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
