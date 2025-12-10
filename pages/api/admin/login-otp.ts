import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyOtpForUser } from '@/lib/admin-otp'
import { supabase } from '@/lib/supabase'
import { generateAdminToken } from '@/lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { username, otp } = req.body || {}
  if (!username || !otp) return res.status(400).json({ error: 'Username and otp are required' })

  // If dev no-auth mode is enabled, skip OTP and DB lookup
  if (process.env.ADMIN_NO_AUTH === 'true') {
    const devAdmin = { id: 'dev-admin', username }
    const token = generateAdminToken(devAdmin)
    return res.status(200).json({ token, admin: devAdmin })
  }

  const ok = verifyOtpForUser(username, String(otp))
  if (!ok) return res.status(401).json({ error: 'Invalid or expired OTP' })

  // Fetch admin user
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username')
    .eq('username', username)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Admin user not found' })

  const token = generateAdminToken({ id: data.id, username: data.username })

  return res.status(200).json({ token, admin: { id: data.id, username: data.username } })
}
