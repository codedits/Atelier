import { NextRequest, NextResponse } from 'next/server'

import { Favorite, Product } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/admin-api-utils'
import { supabase as supabaseAnon } from '@/lib/supabase'
import { getUserFromNextRequest } from '@/lib/user-auth'

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const supabase = supabaseAdmin || supabaseAnon
  const user = getUserFromNextRequest(req)

  if (user) {
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        product:products (*)
      `)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const products = (favorites || [])
      .map((f: any) => f.product)
      .filter((p: any) => p && !p.is_hidden)

    return NextResponse.json(products as Product[], { status: 200 })
  }

  const url = new URL(req.url)
  const client_token = url.searchParams.get('client_token')

  if (!client_token) {
    return NextResponse.json({ error: 'client_token is required' }, { status: 400 })
  }

  const { data: favorites, error: favError } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('client_token', client_token)

  if (favError) {
    return NextResponse.json({ error: favError.message }, { status: 500 })
  }

  if (!favorites || favorites.length === 0) {
    return NextResponse.json([], { status: 200 })
  }

  const productIds = favorites.map((f) => f.product_id)
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
    .eq('is_hidden', false)

  if (prodError) {
    return NextResponse.json({ error: prodError.message }, { status: 500 })
  }

  return NextResponse.json(products as Product[], { status: 200 })
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const supabase = supabaseAdmin || supabaseAnon
  const user = getUserFromNextRequest(req)
  const body = await req.json()
  const { product_id, client_token } = body

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  }

  if (user && supabaseAdmin) {
    const { data: existing } = await supabaseAdmin
      .from('user_favorites')
      .select('id')
      .eq('product_id', product_id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ success: true, message: 'Already in favorites' }, { status: 200 })
    }

    const { error } = await supabaseAdmin
      .from('user_favorites')
      .insert([{ product_id, user_id: user.id }])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Added to favorites' }, { status: 201 })
  }

  if (!client_token) {
    return NextResponse.json({ error: 'client_token is required for non-authenticated users' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('product_id', product_id)
    .eq('client_token', client_token)
    .single()

  if (existing) {
    return NextResponse.json({ success: true, message: 'Already in favorites' }, { status: 200 })
  }

  const { data, error } = await supabase
    .from('favorites')
    .insert([{ product_id, client_token }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data as Favorite, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const supabase = supabaseAdmin || supabaseAnon
  const user = getUserFromNextRequest(req)
  const body = await req.json()
  const { product_id, client_token } = body

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 })
  }

  if (user && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('user_favorites')
      .delete()
      .eq('product_id', product_id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Removed from favorites' }, { status: 200 })
  }

  if (!client_token) {
    return NextResponse.json({ error: 'client_token is required for non-authenticated users' }, { status: 400 })
  }

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('product_id', product_id)
    .eq('client_token', client_token)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Removed from favorites' }, { status: 200 })
}
