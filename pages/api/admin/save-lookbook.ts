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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const admin = getAdminFromRequest(req)
    if (!admin) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!supabaseAdmin) {
        return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' })
    }

    try {
        const { title, subtitle } = req.body

        // Validate inputs
        if (typeof title !== 'string' || title.trim().length === 0) {
            return res.status(400).json({ error: 'title is required and must be a non-empty string' })
        }
        if (subtitle !== undefined && typeof subtitle !== 'string') {
            return res.status(400).json({ error: 'subtitle must be a string' })
        }

        const cleanTitle = title.trim().slice(0, 200)
        const cleanSubtitle = (subtitle || '').trim().slice(0, 200)

        // Use upsert with onConflict to handle existing section_key
        const { error } = await supabaseAdmin
            .from('homepage_sections')
            // @ts-ignore
            .upsert({
                section_key: 'lookbook',
                title: cleanTitle,
                subtitle: cleanSubtitle,
                is_active: true
            }, { onConflict: 'section_key' })

        if (error) throw error

        return res.status(200).json({ success: true })
    } catch (err: any) {
        console.error('Save lookbook error:', err)
        return res.status(500).json({ error: err.message || 'Failed to save lookbook settings' })
    }
}
