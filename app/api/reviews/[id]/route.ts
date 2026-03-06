import { NextRequest, NextResponse } from 'next/server'

import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: ReturnType<typeof createClient> | null = null
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const reviewId = String(id)
  const client = supabaseAdmin ?? supabase

  try {
    const { data: review, error } = await client
      .from('product_reviews')
      .select('*')
      .eq('id', reviewId)
      .single()

    if (error) throw error
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(review, { status: 200 })
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 })
  }
}
