import { revalidatePath } from 'next/cache'
import { apiCache } from '@/lib/server-cache'
import { invalidateSSGCache } from '@/lib/cache'

type RevalidateTarget = {
  path: string
  type?: 'layout' | 'page'
}

const TAG_TARGETS: Record<string, RevalidateTarget[]> = {
  products: [
    { path: '/' },
    { path: '/products' },
    { path: '/products/[id]', type: 'page' },
  ],
  categories: [
    { path: '/' },
    { path: '/products' },
  ],
  site_config: [
    { path: '/' },
  ],
  store_settings: [
    { path: '/' },
  ],
  hero_images: [
    { path: '/' },
  ],
  featured_collections: [
    { path: '/' },
  ],
  testimonials: [
    { path: '/' },
  ],
  announcements: [
    { path: '/' },
  ],
  homepage_sections: [
    { path: '/' },
  ],
  lookbook_images: [
    { path: '/' },
  ],
  reviews: [
    { path: '/' },
    { path: '/products/[id]', type: 'page' },
  ],
  orders: [
    { path: '/account' },
    { path: '/orders/[id]', type: 'page' },
  ],
}

/**
 * Revalidate Next.js ISR pages associated with a tag.
 * Accepts a single tag or an array of tags.
 */
export function revalidateForTag(tag: string | string[]) {
  const tags = Array.isArray(tag) ? tag : [tag]
  const seen = new Set<string>()

  for (const t of tags) {
    const targets = TAG_TARGETS[t] || [{ path: '/' }]
    for (const target of targets) {
      const key = `${target.path}::${target.type || ''}`
      if (seen.has(key)) continue
      seen.add(key)
      if (target.type) {
        revalidatePath(target.path, target.type)
      } else {
        revalidatePath(target.path)
      }
    }
  }
}

/**
 * Full cache invalidation: clears API cache + SSG cache + ISR pages.
 * Use this in every admin API route after a mutation.
 * Accepts a single tag or an array of tags.
 */
export function invalidateAll(tag: string | string[]) {
  const tags = Array.isArray(tag) ? tag : [tag]
  for (const t of tags) {
    apiCache.invalidateByTag(t)
    invalidateSSGCache(t)
  }
  revalidateForTag(tags)
}
