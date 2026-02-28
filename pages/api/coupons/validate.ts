import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'

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

  const { code, order_total } = req.body

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Coupon code is required' })
  }

  const normalizedCode = code.trim().toUpperCase()

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .eq('is_active', true)
    .single()

  if (error || !coupon) {
    return res.status(404).json({ error: 'Invalid coupon code' })
  }

  // Check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return res.status(400).json({ error: 'This coupon has expired' })
  }

  // Check start date
  if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
    return res.status(400).json({ error: 'This coupon is not yet active' })
  }

  // Check usage limit
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return res.status(400).json({ error: 'This coupon has reached its usage limit' })
  }

  // Check minimum order amount
  const total = Number(order_total) || 0
  if (coupon.min_order_amount && total < coupon.min_order_amount) {
    return res.status(400).json({
      error: `Minimum order amount of ₨${coupon.min_order_amount.toLocaleString()} required`
    })
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

  return res.status(200).json({
    valid: true,
    code: coupon.code,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    discount_amount: Math.round(discount),
  })
}
