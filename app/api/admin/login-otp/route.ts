import { NextRequest, NextResponse } from 'next/server'
import { verifyOtpForUser } from '@/lib/admin-otp'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null

const supabaseAnon =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export async function POST(req: NextRequest) {
  const { generateAdminToken } = await import('@/lib/admin-auth')
  const { username, otp } = await req.json()

  if (!username || !otp) {
    return NextResponse.json({ error: 'Username and otp are required' }, { status: 400 })
  }

  if (process.env.ADMIN_NO_AUTH === 'true') {
    const devAdmin = { id: 'dev-admin', username }
    const token = generateAdminToken(devAdmin)
    return NextResponse.json({ token, admin: devAdmin })
  }

  const ok = verifyOtpForUser(username, String(otp))
  if (!ok) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
  }

  const client = supabaseAdmin ?? supabaseAnon
  if (!client) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 })
  }
  const { data, error } = await client
    .from('admin_users')
    .select('id, username')
    .eq('username', username)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
  }

  const token = generateAdminToken({ id: data.id, username: data.username })

  return NextResponse.json({ token, admin: { id: data.id, username: data.username } })
}
