import type { NextApiRequest, NextApiResponse } from 'next'
import { getUserFromRequest } from '@/lib/user-auth'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const user = getUserFromRequest(req)

  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  // Optionally fetch fresh user data from database
  const supabase = getSupabaseAdmin()
  if (supabase) {
    const { data: freshUser } = await supabase
      .from('users')
      .select('id, email, name, phone, address')
      .eq('id', user.id)
      .single()

    if (freshUser) {
      return res.status(200).json({ user: freshUser })
    }
  }

  return res.status(200).json({ user })
}
