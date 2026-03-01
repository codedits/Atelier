import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminToken } from '../../../lib/admin-auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false }
    })
}

function getAdminFromRequest(req: NextApiRequest) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return null
    return verifyAdminToken(authHeader.substring(7))
}

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const admin = getAdminFromRequest(req)
    if (!admin) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' })
    }

    try {
        if (req.method === 'POST') {
            // Insert multiple rows (from upload flow)
            const { records } = req.body
            if (!Array.isArray(records) || records.length === 0) {
                return res.status(400).json({ error: 'records must be a non-empty array' })
            }
            // Validate each record
            const sanitized = records.map((r: any) => ({
                image_url: typeof r.image_url === 'string' ? r.image_url.trim() : '',
                display_order: typeof r.display_order === 'number' ? r.display_order : 0,
                is_active: r.is_active !== false,
            })).filter((r: any) => r.image_url.length > 0)

            if (sanitized.length === 0) {
                return res.status(400).json({ error: 'No valid records provided' })
            }

            // @ts-ignore
            const { data, error } = await supabaseAdmin.from('lookbook_images').insert(sanitized).select()
            if (error) throw error
            return res.status(200).json({ success: true, data })

        } else if (req.method === 'PUT') {
            const { updates, id } = req.body
            if (id) {
                // Update single image — sanitize fields
                const clean = sanitizeUpdates(updates || {})
                if (Object.keys(clean).length === 0) {
                    return res.status(400).json({ error: 'No valid fields to update' })
                }
                // @ts-ignore
                const { error } = await supabaseAdmin.from('lookbook_images').update(clean).eq('id', id)
                if (error) throw error
            } else if (Array.isArray(updates)) {
                // Upsert array (for shuffle) — only allow id + display_order
                const safeUpdates = updates.map((u: any) => ({
                    id: u.id,
                    display_order: typeof u.display_order === 'number' ? u.display_order : 0,
                }))
                // @ts-ignore
                const { error } = await supabaseAdmin.from('lookbook_images').upsert(safeUpdates, { onConflict: 'id', ignoreDuplicates: false })
                if (error) throw error
            } else {
                return res.status(400).json({ error: 'Provide id with updates, or an updates array' })
            }
            return res.status(200).json({ success: true })

        } else if (req.method === 'DELETE') {
            const { id } = req.query
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'id query parameter required' })
            }

            // Fetch image_url before deleting so we can clean up storage
            const { data: imageRow } = await supabaseAdmin
                .from('lookbook_images')
                .select('image_url')
                .eq('id', id)
                .single()

            const { error } = await supabaseAdmin.from('lookbook_images').delete().eq('id', id)
            if (error) throw error

            // Best-effort storage cleanup
            if (imageRow?.image_url) {
                try {
                    const url = new URL(imageRow.image_url)
                    // Extract path after /storage/v1/object/public/
                    const match = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/)
                    if (match) {
                        const [, bucket, filePath] = match
                        await supabaseAdmin.storage.from(bucket).remove([filePath])
                    }
                } catch (cleanupErr) {
                    console.warn('Storage cleanup failed (non-fatal):', cleanupErr)
                }
            }

            return res.status(200).json({ success: true })
        }

        return res.status(405).json({ error: 'Method not allowed' })
    } catch (err: any) {
        console.error('Lookbook images API error:', err)
        return res.status(500).json({ error: err.message || 'Failed to update lookbook images' })
    }
}
