import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { generateOtpForUser } from '@/lib/admin-otp'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { username } = req.body || {}
  if (!username) return res.status(400).json({ error: 'Username is required' })

  // If dev mode is enabled, bypass DB check and return test code
  if (process.env.ADMIN_NO_AUTH === 'true') {
    const code = generateOtpForUser(username)
    return res.status(200).json({ ok: true, code })
  }

  // Ensure the admin user exists
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, username')
    .eq('username', username)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Admin user not found' })
  }

  const code = generateOtpForUser(username)

  // For a simple flow return the code in the response and log it.
  // Replace this with an email/SMS in production.
  return res.status(200).json({ ok: true, code })
}
