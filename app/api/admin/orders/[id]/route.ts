import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'
import { sendDeliveryNotificationEmail, sendShippingNotificationEmail } from '@/lib/email'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const { id } = await context.params
  const orderId = String(id)

  const { data, error } = await adminClient
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json(data, { status: 200 })
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const { id } = await context.params
  const orderId = String(id)
  const { status, payment_status } = await req.json()
  const updates: Record<string, string> = {}

  if (status) updates.status = status
  if (payment_status) updates.payment_status = payment_status

  const { data: currentOrder, error: fetchError } = await adminClient
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single() as { data: any, error: any }

  if (fetchError || !currentOrder) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const { data, error } = await adminClient
    .from('orders')
    .update(updates as any)
    .eq('id', orderId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (status && status !== currentOrder.status) {
    try {
      await adminClient
        .from('order_status_history')
        .insert({ order_id: orderId, old_status: currentOrder.status, new_status: status, changed_by: 'admin' } as any)
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
        } as any)
    } catch (historyErr) {
      console.error('Failed to record payment status history:', historyErr)
    }
  }

  if (status === 'shipped' && currentOrder.status !== 'shipped') {
    const customerEmail = currentOrder.email
    if (customerEmail) {
      try {
        await sendShippingNotificationEmail({
          to: customerEmail,
          orderId: currentOrder.id,
          userName: currentOrder.user_name,
          items: currentOrder.items || [],
          totalPrice: currentOrder.total_price,
        })
      } catch (emailError) {
        console.error('Failed to send shipping notification email:', emailError)
      }
    }
  }

  if (status === 'delivered' && currentOrder.status !== 'delivered') {
    const customerEmail = currentOrder.email
    if (customerEmail) {
      try {
        await sendDeliveryNotificationEmail({
          to: customerEmail,
          orderId: currentOrder.id,
          userName: currentOrder.user_name,
          items: currentOrder.items || [],
          totalPrice: currentOrder.total_price,
        })
      } catch (emailError) {
        console.error('Failed to send delivery notification email:', emailError)
      }
    }
  }

  apiCache.invalidateByTag('orders')
  invalidateSSGCache('orders')
  return NextResponse.json(data, { status: 200 })
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(req)
  if ('error' in auth) return auth.error

  const adminClient = getSupabaseAdmin()
  if (!adminClient) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server' }, { status: 500 })

  const { id } = await context.params
  const orderId = String(id)

  try {
    const { data: order, error: fetchError } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single() as { data: any, error: any }

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

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

    const { error: deleteError } = await adminClient
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
    }

    apiCache.invalidateByTag('products')
    apiCache.invalidateByTag('orders')
    invalidateSSGCache('products')
    invalidateSSGCache('orders')

    return NextResponse.json({ message: 'Order removed successfully', order_id: orderId }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}