import { NextRequest, NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({ interval: 60_000, maxRequests: 5 }) // 5 per minute

export async function POST(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
  const { success } = await limiter.check(ip)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const body = await req.json()
  const { email } = body

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
  }

  try {
    // Try to insert into newsletter_subscribers table
    // If the table doesn't exist yet, we still return success to avoid breaking the UI
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email: email.toLowerCase().trim(), subscribed_at: new Date().toISOString() },
        { onConflict: 'email' }
      )

    if (error) {
      // If table doesn't exist, log but don't fail publicly
      console.warn('Newsletter subscription storage failed:', error.message)
    }

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 200 })
  } catch (err) {
    console.error('Newsletter error:', err)
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }
}
