import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminToken } from '@/lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.substring(7)
  const admin = verifyAdminToken(token)

  if (!admin) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  res.status(200).json({ valid: true, admin })
}
