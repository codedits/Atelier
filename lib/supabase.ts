import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database schema
export interface Product {
  id: string
  name: string
  description: string
  price: number
  old_price?: number
  category: string
  gender: 'men' | 'women' | 'unisex'
  image_url: string
  images?: string[]
  stock: number
  is_hidden?: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
}

export interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string
}

export interface Order {
  id: string
  user_name: string
  phone: string
  address: string
  items: OrderItem[]
  total_price: number
  payment_method: 'COD' | 'Bank Transfer'
  payment_status: 'pending' | 'paid'
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
}

export interface Favorite {
  id: string
  product_id: string
  client_token: string
}
