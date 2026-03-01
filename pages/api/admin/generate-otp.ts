import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { generateOtpForUser } from '@/lib/admin-otp'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
}

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
  const client = supabaseAdmin ?? supabase
  const { data, error } = await client
    .from('admin_users')
    .select('id, username')
    .eq('username', username)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: 'Admin user not found' })
  }

  const code = generateOtpForUser(username)

  // In development, return the code for testing. In production, send it via email/SMS.
  if (process.env.NODE_ENV !== 'production') {
    return res.status(200).json({ ok: true, code })
  }

  // TODO: Send OTP via email or SMS here
  return res.status(200).json({ ok: true })
}
