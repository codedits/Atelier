import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '../../../lib/admin-auth'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const admin = verifyAdminToken(authHeader.substring(7))
    if (!admin) {
        return res.status(401).json({ error: 'Invalid token' })
    }

    const { tag } = req.body
    if (!tag) {
        return res.status(400).json({ error: 'tag is required' })
    }

    try {
        // Invalidate server-side in-memory caches by tag
        const apiCleared = apiCache.invalidateByTag(tag)
        invalidateSSGCache(tag)

        // Revalidate ISR pages
        await res.revalidate('/')
        try { await res.revalidate('/products') } catch (e) { }

        return res.status(200).json({ revalidated: true, tag, cacheEntriesCleared: apiCleared })
    } catch (err: any) {
        return res.status(500).json({ error: err.message })
    }
}
