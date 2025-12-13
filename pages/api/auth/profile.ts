import type { NextApiResponse } from 'next'
import { withUserAuth, AuthenticatedRequest } from '@/lib/user-auth-middleware'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const userId = req.user.id

  // GET - Fetch current profile
  if (req.method === 'GET') {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, phone, address, created_at, updated_at')
        .eq('id', userId)
        .single()

      if (error || !user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json({ user })
    } catch (error) {
      console.error('Profile fetch error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // PUT/PATCH - Update profile
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { name, phone, address } = req.body

    // Validate inputs
    const updates: Record<string, string> = {}
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.length > 100) {
        return res.status(400).json({ error: 'Invalid name' })
      }
      updates.name = name.trim()
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || phone.length > 30) {
        return res.status(400).json({ error: 'Invalid phone number' })
      }
      // Basic phone validation - allow digits, spaces, +, -, ()
      const phoneRegex = /^[\d\s\+\-\(\)]*$/
      if (phone && !phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone format' })
      }
      updates.phone = phone.trim()
    }

    if (address !== undefined) {
      if (typeof address !== 'string' || address.length > 500) {
        return res.status(400).json({ error: 'Invalid address' })
      }
      updates.address = address.trim()
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' })
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select('id, email, name, phone, address, created_at, updated_at')
        .single()

      if (error) {
        console.error('Profile update error:', error)
        return res.status(500).json({ error: 'Failed to update profile' })
      }

      return res.status(200).json({ success: true, user })
    } catch (error) {
      console.error('Profile update error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withUserAuth(handler)
