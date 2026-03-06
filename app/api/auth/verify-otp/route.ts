import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { buildUserTokenSetCookieHeader, generateUserToken } from '@/lib/user-auth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, otp } = body

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  if (!otp || typeof otp !== 'string') {
    return NextResponse.json({ error: 'OTP is required' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  try {
    // Find valid OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('user_otps')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('otp_code', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (otpError || !otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    // Mark OTP as used
    await supabase
      .from('user_otps')
      .update({ used: true })
      .eq('id', otpRecord.id)

    // Get user with complete profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, phone, address')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Generate JWT token
    const token = generateUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
      },
    }, { status: 200 })

    response.headers.set('Set-Cookie', buildUserTokenSetCookieHeader(token))
    return response
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
