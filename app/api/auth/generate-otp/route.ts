import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { generateOtpCode, getOtpExpiry } from '@/lib/user-auth'
import { sendOtpEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email } = body

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
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
      return NextResponse.json({ error: 'Too many OTP requests. Please try again later.' }, { status: 429 })
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
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
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
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 })
    }

    // Send OTP via email
    const emailSent = await sendOtpEmail({
      to: email,
      otp: otpCode,
    })

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'OTP sent to your email' }, { status: 200 })
  } catch (error) {
    console.error('Generate OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
