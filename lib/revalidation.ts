import { revalidatePath } from 'next/cache'

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
  orders: [
    { path: '/account' },
    { path: '/orders/[id]', type: 'page' },
  ],
}

export function revalidateForTag(tag: string) {
  const targets = TAG_TARGETS[tag] || [{ path: '/' }]
  for (const target of targets) {
    if (target.type) {
      revalidatePath(target.path, target.type)
    } else {
      revalidatePath(target.path)
    }
  }
}
