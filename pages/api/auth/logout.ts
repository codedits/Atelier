import type { NextApiRequest, NextApiResponse } from 'next'
import { clearUserTokenCookie } from '@/lib/user-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  clearUserTokenCookie(res)

  return res.status(200).json({ success: true, message: 'Logged out successfully' })
}
