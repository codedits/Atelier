import { NextRequest, NextResponse } from 'next/server'

import { getUserFromNextRequest } from '@/lib/user-auth'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'

export async function GET(req: NextRequest) {
  const user = getUserFromNextRequest(req)

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  if (supabase) {
    const { data: freshUser } = await supabase
      .from('users')
      .select('id, email, name, phone, address')
      .eq('id', user.id)
      .single()

    if (freshUser) {
      return NextResponse.json({ user: freshUser }, { status: 200 })
    }
  }

  return NextResponse.json({ user }, { status: 200 })
}
