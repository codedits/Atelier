import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

export default withAdminAuth(async (req, res, { adminClient }) => {
  if (!adminClient) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' })
  }

  if (req.method === 'DELETE') {
    try {
      console.log('Starting delete all orders operation')

      // Get all orders
      const { data: orders, error: fetchError } = await adminClient
        .from('orders')
        .select('*') as { data: any[], error: any }

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        return res.status(500).json({ error: 'Failed to fetch orders', details: fetchError })
      }

      console.log(`Found ${orders?.length || 0} orders to delete`)

      if (!orders || orders.length === 0) {
        return res.status(200).json({
          message: 'No orders to delete',
          deleted_count: 0
        })
      }

      // Restore inventory using atomic RPC (Issue 1: race-condition safe)
      for (const order of orders) {
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
      }

      // Bulk delete all orders in a single query (Issue 7: was O(N²))
      const orderIds = orders.map((o: any) => o.id)
      const { error: deleteError } = await adminClient
        .from('orders')
        .delete()
        .in('id', orderIds)

      if (deleteError) {
        console.error('Bulk delete error:', deleteError)
        return res.status(500).json({ error: 'Failed to delete orders' })
      }

      console.log(`Successfully deleted ${orderIds.length} orders`)
      apiCache.invalidateByTag('products')
      apiCache.invalidateByTag('orders')
      invalidateSSGCache('products')
      invalidateSSGCache('orders')
      try { await res.revalidate('/') } catch { }
      return res.status(200).json({
        message: 'All orders deleted successfully',
        deleted_count: orderIds.length,
      })

    } catch (error) {
      console.error('Delete all orders error:', error)
      return res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
})
