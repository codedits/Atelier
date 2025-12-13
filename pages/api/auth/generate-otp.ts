import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { generateOtpCode, getOtpExpiry } from '@/lib/user-auth'
import { sendOtpEmail } from '@/lib/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    // Rate limiting: max 5 OTPs per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase
      .from('user_otps')
      .select('id', { count: 'exact', head: true })
      .eq('email', email.toLowerCase())
      .gte('created_at', oneHourAgo)

    if (!countError && count !== null && count >= 5) {
      return res.status(429).json({ error: 'Too many OTP requests. Please try again later.' })
    }

    // Check if user exists, if not create them
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (!existingUser) {
      // Create new user
      const { error: createError } = await supabase
        .from('users')
        .insert({ email: email.toLowerCase() })

      if (createError) {
        console.error('Error creating user:', createError)
        return res.status(500).json({ error: 'Failed to create user' })
      }
    }

    // Invalidate any existing OTPs for this email
    await supabase
      .from('user_otps')
      .update({ used: true })
      .eq('email', email.toLowerCase())
      .eq('used', false)

    // Generate new OTP
    const otpCode = generateOtpCode()
    const expiresAt = getOtpExpiry()

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('user_otps')
      .insert({
        email: email.toLowerCase(),
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
      })

    if (otpError) {
      console.error('Error storing OTP:', otpError)
      return res.status(500).json({ error: 'Failed to generate OTP' })
    }

    // Send OTP via email
    const emailSent = await sendOtpEmail({
      to: email,
      otp: otpCode,
    })

    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' })
    }

    return res.status(200).json({ success: true, message: 'OTP sent to your email' })
  } catch (error) {
    console.error('Generate OTP error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
