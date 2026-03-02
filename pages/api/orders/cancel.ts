import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { getUserFromRequest } from '@/lib/user-auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(500).json({ error: 'Server configuration error' })
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

    // Restore product inventory using atomic RPC (race-condition safe)
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.product_id && item.quantity > 0) {
          await supabase.rpc('increment_stock_safe', {
            p_id: item.product_id,
            qty: item.quantity,
          })
        }
      }
    }

    // Soft-cancel: update status instead of deleting (preserves audit trail)
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error cancelling order:', updateError)
      return res.status(500).json({ error: 'Failed to cancel order' })
    }

    // Record in status history
    try {
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          old_status: order.status,
          new_status: 'cancelled',
          changed_by: 'customer',
        })
    } catch (err) {
      console.error('Status history insert failed:', err)
    }

    res.status(200).json({
      message: 'Order cancelled successfully',
      order: updatedOrder,
    })
  } catch (error) {
    console.error('Error in cancel order handler:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
