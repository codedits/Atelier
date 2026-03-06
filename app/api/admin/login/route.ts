import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { verifyAdminCredentials, generateAdminToken } = await import('@/lib/admin-auth')
  const { username, password } = await req.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
  }

  const admin = await verifyAdminCredentials(username, password)

  if (!admin) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = generateAdminToken(admin)

  return NextResponse.json({
    token,
    admin: { id: admin.id, username: admin.username },
  })
}
