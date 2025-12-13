import type { NextApiRequest, NextApiResponse } from 'next'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { generateUserToken, setUserTokenCookie } from '@/lib/user-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, otp } = req.body

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' })
  }

  if (!otp || typeof otp !== 'string') {
    return res.status(400).json({ error: 'OTP is required' })
  }

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(500).json({ error: 'Server configuration error' })
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
      return res.status(401).json({ error: 'Invalid or expired OTP' })
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
      return res.status(401).json({ error: 'User not found' })
    }

    // Generate JWT token
    const token = generateUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
    })

    // Set HTTP-only cookie
    setUserTokenCookie(res, token)

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
      },
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
