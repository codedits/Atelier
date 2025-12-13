import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'
import { getUserFromRequest, UserPayload } from './user-auth'

export interface AuthenticatedRequest extends NextApiRequest {
  user: UserPayload
}

type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void> | void

/**
 * Middleware to protect API routes that require user authentication.
 * Extracts user from JWT cookie and adds to request.
 */
export function withUserAuth(handler: AuthenticatedHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromRequest(req)

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = user

    return handler(req as AuthenticatedRequest, res)
  }
}

/**
 * Optional auth middleware - doesn't require auth but attaches user if present
 */
export function withOptionalUserAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = getUserFromRequest(req)
    if (user) {
      (req as AuthenticatedRequest).user = user
    }
    return handler(req, res)
  }
}
