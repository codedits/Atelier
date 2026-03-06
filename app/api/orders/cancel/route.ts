import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { getUserFromNextRequest } from '@/lib/user-auth'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    const user = getUserFromNextRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Fetch the order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 })
    }

    // Check if order is within 2 days
    const orderDate = new Date(order.created_at)
    const currentDate = new Date()
    const timeDifference = currentDate.getTime() - orderDate.getTime()
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24)

    if (daysDifference >= 2) {
      return NextResponse.json({ error: 'Orders can only be cancelled within 2 days of placement' }, { status: 400 })
    }

    // Check if order is already shipped
    if (order.status === 'shipped' || order.status === 'delivered') {
      return NextResponse.json({ error: 'Order cannot be cancelled after it has been shipped' }, { status: 400 })
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
      return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
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

    return NextResponse.json({
      message: 'Order cancelled successfully',
      order: updatedOrder,
    }, { status: 200 })
  } catch (error) {
    console.error('Error in cancel order handler:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
