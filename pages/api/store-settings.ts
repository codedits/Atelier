import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import { apiCache } from '@/lib/server-cache'

// Public keys that are safe to expose to customers
const PUBLIC_KEYS = [
  'delivery_charge',
  'free_delivery_above',
  'bank_name',
  'bank_account',
  'bank_holder',
  'bank_iban',
  'jazzcash_number',
  'easypaisa_number',
  'cod_areas',
  'contact_phone',
  'contact_email',
]

const SETTINGS_TTL = 5 * 60_000 // 5 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data, hit } = await apiCache.getOrFetch<Record<string, string>>(
      'api:store-settings',
      async () => {
        const { data, error } = await supabase
          .from('store_settings')
          .select('key, value')
          .in('key', PUBLIC_KEYS)
        if (error) throw error
        const settings: Record<string, string> = {}
        data?.forEach(s => { settings[s.key] = s.value })
        return settings
      },
      { ttl: SETTINGS_TTL, tags: ['store_settings'], staleWhileRevalidate: true }
    )

    res.setHeader('X-Cache', hit ? 'HIT' : 'MISS')
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    return res.status(200).json(data)
  } catch (e) {
    console.error('Unexpected error:', e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
