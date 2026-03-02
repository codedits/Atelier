import type { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth } from '@/lib/admin-api-utils'

export default withAdminAuth(async (req, res, { adminClient }) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    if (!adminClient) {
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

        return res.status(200).json({ success: true })
    } catch (err: any) {
        console.error('Save lookbook error:', err)
        return res.status(500).json({ error: err.message || 'Failed to save lookbook settings' })
    }
})
