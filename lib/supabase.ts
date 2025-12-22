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

export interface PaymentProof {
  transaction_id: string
  payment_method: 'jazzcash' | 'easypaisa' | 'bank'
  screenshot_url: string
  delivery_fee_paid: number
  uploaded_at: string
}

export interface Order {
  id: string
  user_name: string
  phone: string
  address: string
  items: OrderItem[]
  total_price: number
  payment_method: 'COD' | 'Bank Transfer'
  payment_status: 'pending' | 'paid' | 'proof_pending' | 'proof_submitted' | 'verified' | 'rejected'
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  payment_proof?: PaymentProof
  created_at: string
  user_email?: string
}

export interface Favorite {
  id: string
  product_id: string
  client_token: string
}

export interface ProductReview {
  id: string
  product_id: string
  order_id: string
  user_name: string
  user_email?: string
  rating: number
  title?: string
  comment: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface ProductReviewStats {
  product_id: string
  review_count: number
  average_rating: number
  five_star: number
  four_star: number
  three_star: number
  two_star: number
  one_star: number
}
