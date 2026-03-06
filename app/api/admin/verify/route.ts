import { NextRequest, NextResponse } from 'next/server'

async function verifyFromRequest(req: NextRequest) {
  const { verifyAdminToken } = await import('@/lib/admin-auth')
  const authHeader = req.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 })
  }

  const token = authHeader.substring(7)
  const admin = verifyAdminToken(token)

  if (!admin) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  return NextResponse.json({ valid: true, admin })
}

export async function GET(req: NextRequest) {
  return await verifyFromRequest(req)
}

export async function POST(req: NextRequest) {
  return await verifyFromRequest(req)
}
