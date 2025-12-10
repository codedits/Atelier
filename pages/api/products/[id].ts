import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase, Product } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Product not found' })
    }

    return res.status(200).json(data as Product)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
