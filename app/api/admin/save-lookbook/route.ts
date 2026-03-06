import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromNextRequest, getSupabaseAdmin } from '@/lib/admin-api-utils'

export async function POST(req: NextRequest) {
    const admin = await getAdminFromNextRequest(req)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = getSupabaseAdmin()
    if (!adminClient) {
        return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
    }

    try {
        const { title, subtitle } = await req.json()

        if (typeof title !== 'string' || title.trim().length === 0) {
            return NextResponse.json({ error: 'title is required and must be a non-empty string' }, { status: 400 })
        }
        if (subtitle !== undefined && typeof subtitle !== 'string') {
            return NextResponse.json({ error: 'subtitle must be a string' }, { status: 400 })
        }

        const cleanTitle = title.trim().slice(0, 200)
        const cleanSubtitle = (subtitle || '').trim().slice(0, 200)

        const { error } = await adminClient
            .from('homepage_sections')
            // @ts-ignore
            .upsert({
                section_key: 'lookbook',
                title: cleanTitle,
                subtitle: cleanSubtitle,
                is_active: true
            }, { onConflict: 'section_key' })

        if (error) throw error

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err: any) {
        console.error('Save lookbook error:', err)
        return NextResponse.json({ error: err.message || 'Failed to save lookbook settings' }, { status: 500 })
    }
}