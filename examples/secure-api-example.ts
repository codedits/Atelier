// Example: Secure API route with rate limiting and validation
// Use this pattern for your sensitive API endpoints

import type { NextApiRequest, NextApiResponse } from 'next'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { isValidEmail, sanitizeString } from '@/lib/validation'

// Configure rate limiter
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Method validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. Rate limiting
  const ip = getClientIp(req)
  const rateLimitResult = limiter.check(ip)
  
  if (!rateLimitResult.success) {
    return res.status(429).json({ 
      error: 'Too many requests. Please try again later.' 
    })
  }

  // 3. Input validation
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  const sanitizedEmail = sanitizeString(email.toLowerCase().trim(), 255)
  const sanitizedPassword = sanitizeString(password, 128)

  // 4. Your business logic here
  try {
    // ... your authentication logic

    res.status(200).json({ success: true })
  } catch (error) {
    // 5. Generic error messages (don't expose internals)
    console.error('Auth error:', error)
    res.status(401).json({ error: 'Authentication failed' })
  }
}
