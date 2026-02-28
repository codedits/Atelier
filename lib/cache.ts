import { supabase } from './supabase'
import { SiteConfig } from './siteConfig'
import { ssgCache } from './server-cache'

/**
 * SSG Data Layer — called from getStaticProps
 * =============================================
 * Uses ssgCache (L1 in-memory + L2 dedup + L3 stale-while-revalidate).
 * ISR (revalidate: N) provides L4 page-level caching on top.
 *
 * The ssgCache deduplicates concurrent calls during a single ISR build,
 * and keeps data warm so rapid revalidations don't hammer Supabase.
 * TTLs here are shorter than ISR — ISR itself is the outer cache layer.
 */

const SSG_TTL = 30_000       // 30s — within an ISR cycle, reuse data
const SSG_STALE_TTL = 120_000 // 2 min — serve stale if Supabase is slow

export async function getCachedSiteConfig(): Promise<SiteConfig | null> {
    const { data } = await ssgCache.getOrFetch<SiteConfig | null>(
        'ssg:site_config',
        async () => {
            const { data, error } = await supabase
                .from('site_config')
                .select('id, theme_colors, typography, features, homepage_layout, nav_menu, updated_at')
                .single()
            if (error) {
                console.error('Error fetching site config:', error)
                return null
            }
            return data as SiteConfig
        },
        { ttl: SSG_TTL, tags: ['site_config'], staleWhileRevalidate: true, staleTTL: SSG_STALE_TTL }
    )
    return data
}

export async function getCachedHeroImages() {
    const { data } = await ssgCache.getOrFetch(
        'ssg:hero_images',
        async () => {
            const { data, error } = await supabase
                .from('hero_images')
                .select('id, image_url, title, subtitle, cta_text, cta_link, display_order, is_active')
                .eq('is_active', true)
                .order('display_order', { ascending: true })
            if (error) return []
            return data || []
        },
        { ttl: SSG_TTL, tags: ['hero_images'], staleWhileRevalidate: true, staleTTL: SSG_STALE_TTL }
    )
    return data
}

export async function getCachedFeaturedCollections() {
    const { data } = await ssgCache.getOrFetch(
        'ssg:featured_collections',
        async () => {
            const { data, error } = await supabase
                .from('featured_collections')
                .select('id, title, description, image_url, link, display_order, is_active')
                .eq('is_active', true)
                .order('display_order', { ascending: true })
            if (error) return []
            return data || []
        },
        { ttl: SSG_TTL, tags: ['featured_collections'], staleWhileRevalidate: true, staleTTL: SSG_STALE_TTL }
    )
    return data
}

export async function getCachedNewArrivals() {
    const { data } = await ssgCache.getOrFetch(
        'ssg:new_arrivals',
        async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, slug, price, old_price, category, image_url, images, is_hidden, is_featured')
                .eq('is_hidden', false)
                .order('created_at', { ascending: false })
                .limit(6)
            if (error) return []
            return data || []
        },
        { ttl: SSG_TTL, tags: ['products'], staleWhileRevalidate: true, staleTTL: SSG_STALE_TTL }
    )
    return data
}

export async function getCachedFeaturedProducts() {
    const { data } = await ssgCache.getOrFetch(
        'ssg:featured_products',
        async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, slug, price, old_price, category, image_url, images')
                .eq('is_hidden', false)
                .eq('is_featured', true)
                .order('created_at', { ascending: false })
                .limit(10)
            if (error) return []
            return data || []
        },
        { ttl: SSG_TTL, tags: ['products'], staleWhileRevalidate: true, staleTTL: SSG_STALE_TTL }
    )
    return data
}

export async function getCachedTestimonials() {
    const { data } = await ssgCache.getOrFetch(
        'ssg:testimonials',
        async () => {
            const { data, error } = await supabase
                .from('testimonials')
                .select('id, customer_name, content, rating, display_order, is_active')
                .eq('is_active', true)
                .order('display_order', { ascending: true })
            if (error) return []
            return data || []
        },
        { ttl: SSG_TTL, tags: ['testimonials'], staleWhileRevalidate: true, staleTTL: SSG_STALE_TTL }
    )
    return data
}

// Derives CollectionsHighlight data from the same featured_collections query
export async function getCachedCollectionsHighlight() {
    // Reuses the cached result from getCachedFeaturedCollections (same cache key)
    const collections = await getCachedFeaturedCollections()

    return (collections || []).slice(0, 6).map((c: any) => ({
        id: c.id,
        title: c.title,
        subtitle: c.description || '',
        image: c.image_url,
        link: c.link || '/products',
        badge: c.badge || null,
        color: '#7A4A2B'
    }))
}

/** Invalidate SSG caches after admin mutations */
export function invalidateSSGCache(tag?: string) {
    if (tag) {
        ssgCache.invalidateByTag(tag)
    } else {
        ssgCache.clear()
    }
}

export async function getCachedAnnouncements() {
    const { data } = await ssgCache.getOrFetch(
        'ssg:announcements',
        async () => {
            const { data, error } = await supabase
                .from('announcements')
                .select('id, text, link, link_text, icon, display_order, is_active')
                .eq('is_active', true)
                .order('display_order', { ascending: true })
            if (error) return []
            return data || []
        },
        { ttl: SSG_TTL, tags: ['announcements'], staleWhileRevalidate: true, staleTTL: SSG_STALE_TTL }
    )
    return data
}

export async function getCachedHomepageSections() {
    const { data } = await ssgCache.getOrFetch(
        'ssg:homepage_sections',
        async () => {
            const { data, error } = await supabase
                .from('homepage_sections')
                .select('id, section_key, title, subtitle, content, image_url, cta_text, cta_link, metadata, is_active')
                .eq('is_active', true)
            if (error) return []
            return data || []
        },
        { ttl: SSG_TTL, tags: ['homepage_sections'], staleWhileRevalidate: true, staleTTL: SSG_STALE_TTL }
    )
    return data
}

