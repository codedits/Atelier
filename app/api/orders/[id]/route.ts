import { NextRequest, NextResponse } from 'next/server'

import { Order } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { getUserFromNextRequest } from '@/lib/user-auth'

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const user = getUserFromNextRequest(req)

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.user_id) {
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
  }

  const { data: history } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true })

  let can_cancel = false
  if (order.status === 'pending') {
    const orderDate = new Date(order.created_at)
    const daysDiff = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
    can_cancel = daysDiff < 2
  }

  return NextResponse.json({ ...order, status_history: history || [], can_cancel } as Order & { status_history: any[], can_cancel: boolean }, { status: 200 })
}
