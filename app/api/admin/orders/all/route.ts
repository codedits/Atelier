import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { invalidateAll } from '@/lib/revalidation'

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })
  }

  try {
    const { data: orders, error: fetchError } = await adminClient
      .from('orders')
      .select('*') as { data: any[], error: any }

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch orders', details: fetchError }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ message: 'No orders to delete', deleted_count: 0 }, { status: 200 })
    }

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

    const orderIds = orders.map((o: any) => o.id)
    const { error: deleteError } = await adminClient
      .from('orders')
      .delete()
      .in('id', orderIds)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete orders' }, { status: 500 })
    }

    invalidateAll(['products', 'orders'])

    return NextResponse.json({
      message: 'All orders deleted successfully',
      deleted_count: orderIds.length,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}