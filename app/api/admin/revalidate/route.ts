import { NextRequest, NextResponse } from 'next/server'

import { invalidateAll } from '@/lib/revalidation'

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { verifyAdminToken } = await import('@/lib/admin-auth')
    const admin = verifyAdminToken(authHeader.substring(7))
    if (!admin) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { tag } = await req.json()
    if (!tag) {
        return NextResponse.json({ error: 'tag is required' }, { status: 400 })
    }

    try {
        invalidateAll(tag)
        return NextResponse.json({ revalidated: true, tag }, { status: 200 })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}