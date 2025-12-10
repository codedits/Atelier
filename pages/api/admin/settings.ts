import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

function getAdminFromRequest(req: NextApiRequest) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyAdminToken(authHeader.substring(7))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = getAdminFromRequest(req)
  if (!admin) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')

    if (error) return res.status(500).json({ error: error.message })
    
    // Convert array to object for easier use
    const settings: Record<string, string> = {}
    data?.forEach(s => { settings[s.key] = s.value })
    
    return res.status(200).json(settings)
  }

  if (req.method === 'PUT') {
    const updates = req.body as Record<string, string>

    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      await supabase
        .from('store_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    }

    return res.status(200).json({ message: 'Settings updated' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
