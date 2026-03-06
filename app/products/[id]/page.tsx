import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase, Product, ProductReview, ProductReviewStats } from '@/lib/supabase'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import ProductDetailClientPage from './ProductDetailClientPage'

export const revalidate = 3600
export const dynamicParams = true

interface ProductDetailPageData {
  product: (Product & { images?: string[] }) | null
  relatedProducts: Product[]
  reviews: ProductReview[]
  reviewStats: ProductReviewStats | null
}

async function getProductByParam(id: string): Promise<(Product & { images?: string[] }) | null> {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  const query = supabase.from('products').select('*')
  const { data, error } = isUUID
    ? await query.eq('id', id).single()
    : await query.eq('slug', id).single()

  if (error || !data) return null

  return {
    ...data,
    images: data.images && data.images.length > 0
      ? data.images
      : data.image_url
        ? [data.image_url]
        : ['https://via.placeholder.com/600?text=No+Image'],
  }
}

async function getProductPageData(id: string): Promise<ProductDetailPageData | null> {
  const product = await getProductByParam(id)
  if (!product) return null

  const { data: relatedProducts } = await supabase
    .from('products')
    .select('id, name, slug, description, price, old_price, category, gender, image_url, images, stock, created_at')
    .eq('category', product.category)
    .neq('id', product.id)
    .or('is_hidden.is.null,is_hidden.eq.false')
    .limit(4)

  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('id, product_id, order_id, user_name, rating, title, comment, is_verified_purchase, is_approved, created_at, updated_at')
    .eq('product_id', product.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: reviewStats } = await supabase
    .from('product_review_stats')
    .select('product_id, review_count, average_rating, five_star, four_star, three_star, two_star, one_star')
    .eq('product_id', product.id)
    .single()

  return {
    product,
    relatedProducts: relatedProducts || [],
    reviews: reviews || [],
    reviewStats: reviewStats || null,
  }
}

export async function generateStaticParams() {
  const { data: products } = await supabase
    .from('products')
    .select('id, slug')
    .or('is_hidden.is.null,is_hidden.eq.false')
    .limit(100)

  const paths: Array<{ id: string }> = []
  for (const product of products || []) {
    paths.push({ id: product.id })
    if (product.slug) paths.push({ id: product.slug })
  }

  return paths
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const product = await getProductByParam(id)

  if (!product) {
    return {
      title: `Product Not Found | ${SITE_NAME}`,
    }
  }

  const imageUrl = product.images?.[0] || product.image_url
  const canonical = `${SITE_URL}/products/${product.slug || product.id}`

  return {
    title: `${product.name} — Buy Luxury Jewelry | ${SITE_NAME}`,
    description: `${product.description?.slice(0, 155)}...` || `Shop ${product.name} - handcrafted luxury ${product.category?.toLowerCase()} from ${SITE_NAME}.`,
    keywords: `${product.name}, ${product.category}, luxury jewelry, fine jewellery, handcrafted, buy online`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description: product.description || `Shop ${product.name} from Atelier`,
      images: [imageUrl],
      type: 'website',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${SITE_NAME}`,
      description: product.description || `Shop ${product.name}`,
      images: [imageUrl],
    },
  }
}

export default async function ProductDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const pageData = await getProductPageData(id)

  if (!pageData || !pageData.product) {
    notFound()
  }

  return (
    <ProductDetailClientPage
      product={pageData.product}
      relatedProducts={pageData.relatedProducts}
      reviews={pageData.reviews}
      reviewStats={pageData.reviewStats}
    />
  )
}