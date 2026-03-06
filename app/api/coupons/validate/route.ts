import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseAdmin } from '@/lib/admin-api-utils'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const body = await req.json()
  const { code, order_total } = body

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
  }

  const normalizedCode = code.trim().toUpperCase()

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
  }

  // Check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
  }

  // Check start date
  if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
    return NextResponse.json({ error: 'This coupon is not yet active' }, { status: 400 })
  }

  // Check usage limit
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
  }

  // Check minimum order amount
  const total = Number(order_total) || 0
  if (coupon.min_order_amount && total < coupon.min_order_amount) {
    return NextResponse.json({
      error: `Minimum order amount of Rs ${coupon.min_order_amount.toLocaleString()} required`
    }, { status: 400 })
  }

  // Calculate discount
  let discount = 0
  if (coupon.discount_type === 'percentage') {
    discount = (total * coupon.discount_value) / 100
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount
    }
  } else {
    discount = coupon.discount_value
  }

  // Don't let discount exceed order total
  discount = Math.min(discount, total)

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    discount_amount: Math.round(discount),
  }, { status: 200 })
}
