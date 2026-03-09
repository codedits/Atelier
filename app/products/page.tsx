import type { Metadata } from 'next'
import { supabase, Product } from '@/lib/supabase'
import { ssgCache } from '@/lib/server-cache'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import ProductsClientPage from './ProductsClientPage'

export const revalidate = 21600

export const metadata: Metadata = {
  title: 'Shop All Jewelry — Rings, Necklaces, Bracelets & Earrings | Atelier',
  description: 'Browse our complete collection of luxury handcrafted jewelry. Shop fine rings, elegant necklaces, stunning bracelets, and exquisite earrings with free shipping.',
  keywords: 'jewelry shop, buy rings, gold necklaces, diamond bracelets, earrings online, luxury jewelry store',
  openGraph: {
    title: `Shop All Jewelry | ${SITE_NAME}`,
    description: 'Browse our complete collection of handcrafted jewelry. Rings, necklaces, bracelets, and earrings.',
    type: 'website',
    url: `${SITE_URL}/products`,
  },
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
}

const SSG_TTL = 30_000
const SSG_STALE_TTL = 120_000

async function getProducts(): Promise<Product[]> {
  const { data } = await ssgCache.getOrFetch<Product[]>(
    'ssg:all_products',
    async () => {
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, slug, price, old_price, category, gender, image_url, images, stock, is_hidden, description, created_at')
        .or('is_hidden.is.null,is_hidden.eq.false')
        .order('created_at', { ascending: false })
      return productsData || []
    },
    { ttl: SSG_TTL, tags: ['products'], staleWhileRevalidate: true, staleTTL: SSG_STALE_TTL }
  )
  return data
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; gender?: string; search?: string }>
}) {
  const initialProducts = await getProducts()
  const params = await searchParams

  return (
    <ProductsClientPage
      initialProducts={initialProducts}
      initialCategory={params.category ?? null}
      initialGender={params.gender ?? null}
      initialSearch={params.search ?? null}
    />
  )
}