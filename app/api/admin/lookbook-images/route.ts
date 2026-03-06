import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { requireAdmin } from '@/lib/admin-route-utils'

// Whitelist of fields allowed in single-image updates
const ALLOWED_UPDATE_FIELDS = ['title', 'subtitle', 'link', 'is_active', 'display_order'] as const
type AllowedField = typeof ALLOWED_UPDATE_FIELDS[number]

function sanitizeUpdates(raw: Record<string, any>): Record<string, any> {
    const clean: Record<string, any> = {}
    for (const key of ALLOWED_UPDATE_FIELDS) {
        if (key in raw) {
            // Sanitize string fields
            if (['title', 'subtitle', 'link'].includes(key)) {
                clean[key] = typeof raw[key] === 'string' ? raw[key].trim().slice(0, 500) : ''
            } else {
                clean[key] = raw[key]
            }
        }
    }
    return clean
}

export async function POST(req: NextRequest) {
    const auth = await requireAdmin(req)
    if ('error' in auth) return auth.error

    const adminClient = getSupabaseAdmin()
    if (!adminClient) {
        return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
    }

    try {
        const { records } = await req.json()
        if (!Array.isArray(records) || records.length === 0) {
            return NextResponse.json({ error: 'records must be a non-empty array' }, { status: 400 })
        }

        const sanitized = records.map((r: any) => ({
            image_url: typeof r.image_url === 'string' ? r.image_url.trim() : '',
            display_order: typeof r.display_order === 'number' ? r.display_order : 0,
            is_active: r.is_active !== false,
        })).filter((r: any) => r.image_url.length > 0)

        if (sanitized.length === 0) {
            return NextResponse.json({ error: 'No valid records provided' }, { status: 400 })
        }

        const { data, error } = await adminClient.from('lookbook_images').insert(sanitized as any).select()
        if (error) throw error
        return NextResponse.json({ success: true, data }, { status: 200 })
    } catch (err: any) {
        console.error('Lookbook images API error:', err)
        return NextResponse.json({ error: err.message || 'Failed to update lookbook images' }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    const auth = await requireAdmin(req)
    if ('error' in auth) return auth.error

    const adminClient = getSupabaseAdmin()
    if (!adminClient) {
        return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
    }

    try {
        const { updates, id } = await req.json()
        if (id) {
            const clean = sanitizeUpdates(updates || {})
            if (Object.keys(clean).length === 0) {
                return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
            }
            const { error } = await adminClient.from('lookbook_images').update(clean as any).eq('id', id)
            if (error) throw error
        } else if (Array.isArray(updates)) {
            const safeUpdates = updates.map((u: any) => ({
                id: u.id,
                display_order: typeof u.display_order === 'number' ? u.display_order : 0,
            }))
            const { error } = await adminClient.from('lookbook_images').upsert(safeUpdates as any, { onConflict: 'id', ignoreDuplicates: false })
            if (error) throw error
        } else {
            return NextResponse.json({ error: 'Provide id with updates, or an updates array' }, { status: 400 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err: any) {
        console.error('Lookbook images API error:', err)
        return NextResponse.json({ error: err.message || 'Failed to update lookbook images' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const auth = await requireAdmin(req)
    if ('error' in auth) return auth.error

    const adminClient = getSupabaseAdmin()
    if (!adminClient) {
        return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 500 })
    }

    try {
        const id = new URL(req.url).searchParams.get('id')
        if (!id) {
            return NextResponse.json({ error: 'id query parameter required' }, { status: 400 })
        }

        const { data: imageRow } = await adminClient
            .from('lookbook_images')
            .select('image_url')
            .eq('id', id)
            .single()

        const row = imageRow as { image_url?: string } | null

        const { error } = await adminClient.from('lookbook_images').delete().eq('id', id)
        if (error) throw error

        if (row?.image_url) {
            try {
                const url = new URL(row.image_url)
                const match = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/)
                if (match) {
                    const [, bucket, filePath] = match
                    await adminClient.storage.from(bucket).remove([filePath])
                }
            } catch (cleanupErr) {
                console.warn('Storage cleanup failed (non-fatal):', cleanupErr)
            }
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err: any) {
        console.error('Lookbook images API error:', err)
        return NextResponse.json({ error: err.message || 'Failed to update lookbook images' }, { status: 500 })
    }
}