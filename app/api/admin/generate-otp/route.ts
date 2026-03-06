import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateOtpForUser } from '@/lib/admin-otp'

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
  const { username } = await req.json()

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  if (process.env.ADMIN_NO_AUTH === 'true') {
    const code = generateOtpForUser(username)
    return NextResponse.json({ ok: true, code })
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

  const code = generateOtpForUser(username)

  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json({ ok: true, code })
  }

  return NextResponse.json({ ok: true })
}
