import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyAdminCredentials, generateAdminToken } from '@/lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  const admin = await verifyAdminCredentials(username, password)

  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = generateAdminToken(admin)

  res.status(200).json({
    token,
    admin: { id: admin.id, username: admin.username }
  })
}
