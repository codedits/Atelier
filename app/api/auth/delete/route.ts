import { NextRequest, NextResponse } from 'next/server'

import { buildUserTokenClearCookieHeader, deleteUserById, getUserFromNextRequest } from '@/lib/user-auth'

async function deleteAccount(req: NextRequest) {
  const userId = getUserFromNextRequest(req)?.id
  if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const deleted = await deleteUserById(userId)
  if (!deleted) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }

  const response = NextResponse.json({ success: true, message: 'Account deleted' }, { status: 200 })
  response.headers.set('Set-Cookie', buildUserTokenClearCookieHeader())
  return response
}

export async function POST(req: NextRequest) {
  return deleteAccount(req)
}

export async function DELETE(req: NextRequest) {
  return deleteAccount(req)
}