import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase, Product } from '@/lib/supabase'
import { ssgCache } from '@/lib/server-cache'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import { Collection } from '@/app/admin/collections/AdminCollectionsClientPage'
import CollectionClientPage from './CollectionClientPage'

export const revalidate = 3600 // Revalidate every hour

const SSG_TTL = 30_000
const SSG_STALE_TTL = 120_000

async function getCollectionAndProducts(slug: string): Promise<{ collection: Collection; products: Product[] } | null> {
    const { data } = await ssgCache.getOrFetch<{ collection: Collection; products: Product[] } | null>(
        `ssg:collection:${slug}`,
        async () => {
            // Fetch the collection
            const { data: collection, error: collectionError } = await supabase
                .from('collections')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single()

            if (collectionError || !collection) {
                console.error('Failed to fetch collection:', collectionError)
                return null
            }

            // Fetch product mappings
            const { data: cpData, error: cpError } = await supabase
                .from('collection_products')
                .select('product_id')
                .eq('collection_id', collection.id)

            if (cpError) {
                console.error('Failed to fetch collection products:', cpError)
                return { collection, products: [] }
            }

            const productIds = cpData?.map(cp => cp.product_id) || []

            if (productIds.length === 0) {
                return { collection, products: [] }
            }

            // Fetch actual products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('id, name, slug, price, old_price, category, gender, image_url, images, stock, is_hidden, description, created_at')
                .in('id', productIds)
                .or('is_hidden.is.null,is_hidden.eq.false')
                .order('created_at', { ascending: false })

            if (productsError) {
                console.error('Failed to fetch products:', productsError)
                return { collection, products: [] }
            }

            return { collection, products: productsData || [] }
        },
        { ttl: SSG_TTL, tags: ['collections', 'products'], staleWhileRevalidate: true, staleTTL: SSG_STALE_TTL }
    )
    return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params
    // Shares the ssgCache result — no double fetch
    const data = await getCollectionAndProducts(resolvedParams.slug)

    if (!data) {
        return {
            title: `Collection Not Found | ${SITE_NAME}`,
            description: 'The requested collection could not be found.',
        }
    }

    const { collection } = data
    return {
        title: `${collection.name} | Exclusive Collection | ${SITE_NAME}`,
        description: collection.description || `Discover the exclusive ${collection.name} collection.`,
        openGraph: {
            title: `${collection.name} | ${SITE_NAME}`,
            description: collection.description || `Discover the exclusive ${collection.name} collection.`,
            images: collection.image_url ? [{ url: collection.image_url }] : [],
            type: 'website',
            url: `${SITE_URL}/collections/${collection.slug}`,
        },
        alternates: {
            canonical: `${SITE_URL}/collections/${collection.slug}`,
        },
    }
}

export default async function CollectionPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const resolvedParams = await params
    // Shares the ssgCache result — no double fetch
    const data = await getCollectionAndProducts(resolvedParams.slug)

    if (!data) {
        notFound()
    }

    return (
        <CollectionClientPage
            collection={data.collection}
            products={data.products}
        />
    )
}
