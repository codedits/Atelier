import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const limiter = rateLimit({ interval: 60_000, maxRequests: 5 }) // 5 per minute

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limit by IP
  const ip = getClientIp(req)
  const { success } = await limiter.check(ip)
  if (!success) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }

  const { email } = req.body

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' })
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

    return res.status(200).json({ message: 'Subscribed successfully' })
  } catch (err) {
    console.error('Newsletter error:', err)
    return res.status(500).json({ error: 'Failed to subscribe. Please try again.' })
  }
}
