import { Metadata } from 'next'
import HomeClientPage from './HomeClientPage'
import { supabase } from '@/lib/supabase'
import {
  getCachedSiteConfig,
  getCachedHeroImages,
  getCachedFeaturedCollections,
  getCachedNewArrivals,
  getCachedTestimonials,
  getCachedFeaturedProducts,
  getCachedAnnouncements,
  getCachedHomepageSections,
} from '@/lib/cache'
import { SITE_URL, SITE_NAME, INSTAGRAM_URL, FACEBOOK_URL, PINTEREST_URL } from '@/lib/constants'

export const revalidate = 21600

interface Product {
  id: string
  name: string
  slug?: string
  price: number
  old_price?: number
  category: string
  image_url: string
  images?: string[]
  is_hidden?: boolean
}

interface Collection {
  id: string
  title: string
  description?: string
  image_url: string
  link: string
  display_order: number
}

export const metadata: Metadata = {
  title: 'Atelier — Luxury Fine Jewellery | Handcrafted Rings, Necklaces & More',
  description:
    'Discover exquisite handcrafted fine jewellery at Atelier. Shop luxury rings, necklaces, bracelets, and earrings crafted by master artisans with premium 18k gold and diamonds.',
  keywords: [
    'fine jewellery',
    'luxury jewelry',
    'handcrafted rings',
    'gold necklaces',
    'diamond earrings',
    'bracelets',
    'artisan jewelry',
    '18k gold',
    'premium accessories',
  ],
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://atelier-amber.vercel.app',
  },
  openGraph: {
    title: 'Atelier — Luxury Fine Jewellery | Timeless Elegance',
    description:
      'Fine jewellery handcrafted by master artisans. Shop rings, necklaces, bracelets and more with worldwide shipping.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://atelier-amber.vercel.app',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    title: 'Atelier — Luxury Fine Jewellery',
    description: 'Exquisite handcrafted fine jewellery. Shop luxury rings, necklaces, bracelets & earrings.',
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop'],
  },
}

export default async function HomePage() {
  const [
    productsData,
    collectionsData,
    configData,
    heroImagesData,
    testimonialsData,
    featuredProductsData,
    announcementsData,
    homepageSectionsData,
  ] = await Promise.all([
    getCachedNewArrivals(),
    getCachedFeaturedCollections(),
    getCachedSiteConfig(),
    getCachedHeroImages(),
    getCachedTestimonials(),
    getCachedFeaturedProducts(),
    getCachedAnnouncements(),
    getCachedHomepageSections(),
  ])

  const defaultCollections = [
    {
      id: '1',
      title: 'Rings',
      image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
      link: '/products?category=rings',
      display_order: 0,
    },
    {
      id: '2',
      title: 'Necklaces',
      image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
      link: '/products?category=necklaces',
      display_order: 1,
    },
    {
      id: '3',
      title: 'Bracelets',
      image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop',
      link: '/products?category=bracelets',
      display_order: 2,
    },
    {
      id: '4',
      title: 'Earrings',
      image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
      link: '/products?category=earrings',
      display_order: 3,
    },
  ]

  const { data: lookbookImages } = await supabase
    .from('lookbook_images')
    .select('id, image_url, title, subtitle, link')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  const defaultLayout = [
    'hero', 'limited_drop', 'announcement_banner', 'value_proposition', 'featured_collections', 'logo_marquee',
    'process_steps', 'lookbook', 'trending_now', 'craftsmanship', 'new_arrivals', 'testimonials', 'instagram_gallery', 'newsletter',
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: 'Exquisite handcrafted fine jewellery',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/products?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/atelier%20s.svg`,
          width: 512,
          height: 512,
        },
        description: 'Luxury fine jewellery handcrafted by master artisans',
        sameAs: [INSTAGRAM_URL, FACEBOOK_URL, PINTEREST_URL],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: 'English',
        },
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: 'Atelier — Luxury Fine Jewellery',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
        description: 'Shop luxury handcrafted fine jewellery including rings, necklaces, bracelets, and earrings',
      },
      {
        '@type': 'ItemList',
        name: 'Featured Products',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@type': 'Product',
              name: 'Rings',
              url: `${SITE_URL}/products?category=rings`,
            },
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@type': 'Product',
              name: 'Necklaces',
              url: `${SITE_URL}/products?category=necklaces`,
            },
          },
          {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@type': 'Product',
              name: 'Bracelets',
              url: `${SITE_URL}/products?category=bracelets`,
            },
          },
          {
            '@type': 'ListItem',
            position: 4,
            item: {
              '@type': 'Product',
              name: 'Earrings',
              url: `${SITE_URL}/products?category=earrings`,
            },
          },
        ],
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeClientPage
        newArrivals={(productsData || []) as Product[]}
        featuredProducts={(featuredProductsData || []) as Product[]}
        featuredCollections={
          (collectionsData && collectionsData.length > 0)
            ? (collectionsData as Collection[])
            : defaultCollections
        }
        layout={configData?.homepage_layout || defaultLayout}
        heroImages={heroImagesData || []}
        testimonials={testimonialsData || []}
        siteConfig={configData || null}
        announcements={announcementsData || []}
        homepageSections={homepageSectionsData || []}
        lookbookImages={lookbookImages || []}
      />
    </>
  )
}
