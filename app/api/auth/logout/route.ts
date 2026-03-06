import { NextResponse } from 'next/server'

import { buildUserTokenClearCookieHeader } from '@/lib/user-auth'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 })
  response.headers.set('Set-Cookie', buildUserTokenClearCookieHeader())
  return response
}