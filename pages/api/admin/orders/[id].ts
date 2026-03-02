import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'
import { sendDeliveryNotificationEmail, sendShippingNotificationEmail } from '@/lib/email'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

export default withAdminAuth(async (req, res, { client, adminClient }) => {
  const { id } = req.query
  const orderId = String(id)

  if (req.method === 'GET') {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) return res.status(404).json({ error: 'Order not found' })
    return res.status(200).json(data)
  }

  if (!adminClient) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  if (req.method === 'PUT') {
    const { status, payment_status } = req.body
    const updates: Record<string, string> = {}

    if (status) updates.status = status
    if (payment_status) updates.payment_status = payment_status

    // First get the current order to check status transitions
    const { data: currentOrder, error: fetchError } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single() as { data: any, error: any }

    if (fetchError || !currentOrder) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const { data, error } = await adminClient
      .from('orders')
      // @ts-ignore - Supabase client without typed schema
      .update(updates)
      .eq('id', orderId)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })

    // Record status change in history (Issue 4)
    if (status && status !== currentOrder.status) {
      try {
        await adminClient
          .from('order_status_history')
          .insert({
            order_id: orderId,
            old_status: currentOrder.status,
            new_status: status,
            changed_by: 'admin',
          })
      } catch (historyErr) {
        console.error('Failed to record status history:', historyErr)
      }
    }

    if (payment_status && payment_status !== currentOrder.payment_status) {
      try {
        await adminClient
          .from('order_status_history')
          .insert({
            order_id: orderId,
            old_status: `payment:${currentOrder.payment_status}`,
            new_status: `payment:${payment_status}`,
            changed_by: 'admin',
          })
      } catch (historyErr) {
        console.error('Failed to record payment status history:', historyErr)
      }
    }

    // Send shipping notification email if status changed to 'shipped' (Issue 3)
    if (status === 'shipped' && currentOrder.status !== 'shipped') {
      const customerEmail = currentOrder.email
      console.log(`Order ${orderId} marked as shipped. Sending shipping notification...`)

      if (customerEmail) {
        try {
          await sendShippingNotificationEmail({
            to: customerEmail,
            orderId: currentOrder.id,
            userName: currentOrder.user_name,
            items: currentOrder.items || [],
            totalPrice: currentOrder.total_price,
          })
          console.log(`✅ Shipping notification email sent to ${customerEmail} for order ${orderId}`)
        } catch (emailError) {
          console.error('❌ Failed to send shipping notification email:', emailError)
        }
      } else {
        console.log(`⚠️ No email address found for order ${orderId}, skipping shipping notification`)
      }
    }

    // Send delivery notification email if status changed to 'delivered'
    if (status === 'delivered' && currentOrder.status !== 'delivered') {
      const customerEmail = currentOrder.email
      console.log(`Order ${orderId} marked as delivered. Sending delivery notification...`)
      console.log(`Customer email: ${customerEmail || 'NOT PROVIDED'}`)

      if (customerEmail) {
        try {
          await sendDeliveryNotificationEmail({
            to: customerEmail,
            orderId: currentOrder.id,
            userName: currentOrder.user_name,
            items: currentOrder.items || [],
            totalPrice: currentOrder.total_price,
          })
          console.log(`✅ Delivery notification email sent to ${customerEmail} for order ${orderId}`)
        } catch (emailError) {
          console.error('❌ Failed to send delivery notification email:', emailError)
          // Don't fail the request if email fails
        }
      } else {
        console.log(`⚠️ No email address found for order ${orderId}, skipping delivery notification`)
      }
    }

    apiCache.invalidateByTag('orders')
    invalidateSSGCache('orders')
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    try {
      // First get the order to restore inventory before deleting
      const { data: order, error: fetchError } = await adminClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single() as { data: any, error: any }

      if (fetchError || !order) {
        console.error('Fetch error:', fetchError)
        return res.status(404).json({ error: 'Order not found' })
      }

      // Restore inventory using atomic RPC (Issue 1: race-condition safe)
      if (order?.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (item.product_id && item.quantity > 0) {
            await adminClient.rpc('increment_stock_safe', {
              p_id: item.product_id,
              qty: item.quantity,
            })
          }
        }
      }

      // Delete the order
      const { error: deleteError } = await adminClient
        .from('orders')
        .delete()
        .eq('id', orderId)

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return res.status(500).json({ error: 'Failed to delete order' })
      }

      // Stock was restored — invalidate products cache too
      apiCache.invalidateByTag('products')
      apiCache.invalidateByTag('orders')
      invalidateSSGCache('products')
      invalidateSSGCache('orders')
      return res.status(200).json({
        message: 'Order removed successfully',
        order_id: orderId
      })

    } catch (error) {
      console.error('Delete order error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
})
