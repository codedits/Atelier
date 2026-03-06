import { NextRequest, NextResponse } from 'next/server'

import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { getUserFromNextRequest } from '@/lib/user-auth'

async function getAuthenticatedUserId(req: NextRequest) {
  const user = getUserFromNextRequest(req)
  return user?.id || null
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const userId = await getAuthenticatedUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, phone, address, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateProfile(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const userId = await getAuthenticatedUserId(req)
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await req.json()
  const { name, phone, address } = body

  const updates: Record<string, string> = {}

  if (name !== undefined) {
    if (typeof name !== 'string' || name.length > 100) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }
    updates.name = name.trim()
  }

  if (phone !== undefined) {
    if (typeof phone !== 'string' || phone.length > 30) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }
    const phoneRegex = /^[\d\s\+\-\(\)]*$/
    if (phone && !phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 })
    }
    updates.phone = phone.trim()
  }

  if (address !== undefined) {
    if (typeof address !== 'string' || address.length > 500) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }
    updates.address = address.trim()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, email, name, phone, address, created_at, updated_at')
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, user }, { status: 200 })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  return updateProfile(req)
}

export async function PATCH(req: NextRequest) {
  return updateProfile(req)
}