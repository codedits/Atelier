import type { NextApiRequest, NextApiResponse } from 'next'
import { withUserAuth } from '@/lib/user-auth-middleware'
import { deleteUserById, clearUserTokenCookie } from '@/lib/user-auth'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // `withUserAuth` ensures req.user exists
  const userReq = req as any
  const userId = userReq.user?.id
  if (!userId) return res.status(401).json({ error: 'Authentication required' })

  const deleted = await deleteUserById(userId)
  if (!deleted) {
    return res.status(500).json({ error: 'Failed to delete account' })
  }

  // Clear cookie
  clearUserTokenCookie(res)

  return res.status(200).json({ success: true, message: 'Account deleted' })
}

export default withUserAuth(handler)
