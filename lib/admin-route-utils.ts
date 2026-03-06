import { NextRequest, NextResponse } from 'next/server'

export async function requireAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { verifyAdminToken } = await import('@/lib/admin-auth')
  const admin = verifyAdminToken(authHeader.substring(7))
  if (!admin) {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) }
  }

  return { admin }
}
