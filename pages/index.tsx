import Head from 'next/head'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { GetStaticProps } from 'next'
import { supabase } from '@/lib/supabase'
import {
  getCachedSiteConfig,
  getCachedHeroImages,
  getCachedFeaturedCollections,
  getCachedNewArrivals,
  getCachedTestimonials,
  getCachedCollectionsHighlight,
  getCachedFeaturedProducts,
  getCachedAnnouncements,
  getCachedHomepageSections
} from '@/lib/cache'
import {
  Header,
  Hero,
  ProductCard,
  FeaturedCollections,
  LogoMarquee,
} from '../components'
import { HeroImage } from '../components/Hero'
import { Testimonial } from '../components/Testimonials'
import { Skeleton } from '@/components/ui/Skeleton'

import { SITE_URL, SITE_NAME, INSTAGRAM_URL, FACEBOOK_URL, PINTEREST_URL } from '@/lib/constants'

// Lazy load below-fold components for faster initial render
const AnnouncementBanner = dynamic(() => import('../components/AnnouncementBanner'), { ssr: true })
const ValueProposition = dynamic(() => import('../components/ValueProposition'), { ssr: true })
const TrendingNow = dynamic(() => import('../components/TrendingNow'), { ssr: true })
const BrandStory = dynamic(() => import('../components/BrandStory'), { ssr: true })

const CollectionsHighlight = dynamic(() => import('../components/CollectionsHighlight'), { ssr: true })
const ProcessSteps = dynamic(() => import('../components/ProcessSteps'), { ssr: true })
const Craftsmanship = dynamic(() => import('../components/Craftsmanship'), { ssr: true })
const Testimonials = dynamic(() => import('../components/Testimonials'), { ssr: true })
const InstagramGallery = dynamic(() => import('../components/InstagramGallery'), { ssr: true })
const Newsletter = dynamic(() => import('../components/Newsletter'), { ssr: true })
const Footer = dynamic(() => import('../components/Footer'), { ssr: true })

interface Product {
  id: string
  name: string
  slug?: string
  price: number
  old_price?: number
  category: string
  image_url: string
  images?: string[] // Array of image URLs for rollover effect
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

interface HomeProps {
  newArrivals: Product[]
  featuredProducts: Product[]
  featuredCollections: Collection[]
  layout: string[]
  heroImages: HeroImage[]
  testimonials: Testimonial[]
  collectionsHighlight: any[]
  siteConfig: any
  announcements: any[]
  homepageSections: any[]
}

// SSG with ISR - Pre-render at build time, revalidate every 60 seconds
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  // Fetch cached products, collections, layout config, hero images, testimonials, and collections highlight in parallel
  const [productsData, collectionsData, configData, heroImagesData, testimonialsData, collectionsHighlightData, featuredProductsData, announcementsData, homepageSectionsData] = await Promise.all([
    getCachedNewArrivals(),
    getCachedFeaturedCollections(),
    getCachedSiteConfig(),
    getCachedHeroImages(),
    getCachedTestimonials(),
    getCachedCollectionsHighlight(),
    getCachedFeaturedProducts(),
    getCachedAnnouncements(),
    getCachedHomepageSections()
  ])

  // Default collections fallback
  const defaultCollections = [
    {
      id: '1',
      title: "Rings",
      image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop",
      link: "/products?category=rings",
      display_order: 0
    },
    {
      id: '2',
      title: "Necklaces",
      image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
      link: "/products?category=necklaces",
      display_order: 1
    },
    {
      id: '3',
      title: "Bracelets",
      image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
      link: "/products?category=bracelets",
      display_order: 2
    },
    {
      id: '4',
      title: "Earrings",
      image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
      link: "/products?category=earrings",
      display_order: 3
    }
  ]

  // Default layout fallback
  const defaultLayout = [
    'hero', 'announcement_banner', 'value_proposition', 'featured_collections', 'logo_marquee', 'collections_highlight',
    'process_steps', 'trending_now', 'craftsmanship', 'brand_story', 'new_arrivals', 'testimonials', 'instagram_gallery', 'newsletter'
  ]

  return {
    props: {
      newArrivals: (productsData || []) as Product[],
      featuredProducts: (featuredProductsData || []) as Product[],
      featuredCollections: (collectionsData && collectionsData.length > 0)
        ? collectionsData as Collection[]
        : defaultCollections,
      layout: configData?.homepage_layout || defaultLayout,
      heroImages: (heroImagesData || []) as HeroImage[],
      testimonials: (testimonialsData || []) as Testimonial[],
      collectionsHighlight: collectionsHighlightData || [],
      siteConfig: configData || null,
      announcements: (announcementsData || []) as any[],
      homepageSections: (homepageSectionsData || []) as any[],
    },
    revalidate: 3600, // ISR: Regenerate page every 1 hour
  }
}

export default function Home({ newArrivals, featuredProducts, featuredCollections, layout, heroImages, testimonials, collectionsHighlight, announcements, homepageSections }: HomeProps) {
  // Memoize for stable reference
  const products = useMemo(() => newArrivals, [newArrivals])
  const featured = useMemo(() => featuredProducts, [featuredProducts])
  const collections = useMemo(() => featuredCollections, [featuredCollections])

  // Build a lookup map by section_key for homepage sections
  const sectionsByKey = useMemo(() => {
    const map: Record<string, any> = {}
    for (const s of homepageSections || []) {
      if (s.section_key) map[s.section_key] = s
    }
    return map
  }, [homepageSections])

  const { ref: sectionRef, isIntersecting } = useIntersectionObserver()

  const activeLayout = layout && layout.length > 0 ? layout : [
    'hero', 'announcement_banner', 'value_proposition', 'featured_collections', 'logo_marquee', 'collections_highlight',
    'process_steps', 'trending_now', 'craftsmanship', 'brand_story', 'new_arrivals', 'testimonials', 'instagram_gallery', 'newsletter'
  ]

  const renderSection = (sectionId: string, index: number) => {
    switch (sectionId) {
      case 'hero':
        return <Hero key={sectionId} heroImages={heroImages} />
      case 'announcement_banner':
        return <AnnouncementBanner key={sectionId} announcements={announcements?.length ? announcements : undefined} />
      case 'value_proposition':
        return <ValueProposition key={sectionId} />
      case 'featured_collections':
        return <FeaturedCollections key={sectionId} collections={collections} />
      case 'logo_marquee':
        return <LogoMarquee key={sectionId} />
      case 'collections_highlight':
        return <CollectionsHighlight key={sectionId} highlights={collectionsHighlight.length > 0 ? collectionsHighlight : undefined} />
      case 'process_steps':
        return <ProcessSteps key={sectionId} data={sectionsByKey['process_steps']} />
      case 'trending_now':
        return featured.length > 0 ? <TrendingNow key={sectionId} products={featured} /> : null
      case 'craftsmanship':
        return <Craftsmanship key={sectionId} data={sectionsByKey['craftsmanship']} />
      case 'brand_story':
        return <BrandStory key={sectionId} data={sectionsByKey['brand_story']} />
      case 'new_arrivals':
        return (
          <section
            key={sectionId}
            id="new-arrivals"
            className="luxury-section bg-[#FAF9F6] will-change-transform"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8" ref={sectionRef}>
              <div
                className={cn(
                  "text-center mb-16 md:mb-20 transition-all duration-700 invisible-before-reveal",
                  isIntersecting && "reveal-slide-up"
                )}
              >
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#1A1A1A] mb-4">
                  Latest Creations
                </p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6 text-[#1A1A1A]">New Arrivals</h2>
                <div className="luxury-divider mt-6">
                  <div className="luxury-divider-diamond" />
                </div>
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {products.map((product, pIndex) => (
                    <div
                      key={product.id}
                      className={cn(
                        "will-change-transform invisible-before-reveal min-h-[400px]",
                        isIntersecting && "reveal-slide-up"
                      )}
                      style={{ animationDelay: isIntersecting ? `${pIndex * 120}ms` : '0ms' }}
                    >
                      <ProductCard
                        id={product.id}
                        slug={product.slug}
                        name={product.name}
                        price={product.price}
                        oldPrice={product.old_price}
                        img={product.image_url}
                        images={product.images}
                        category={product.category}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col space-y-4">
                      <Skeleton className="h-[400px] w-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={cn(
                  "text-center mt-16 invisible-before-reveal",
                  isIntersecting && "reveal-slide-up"
                )}
                style={{ animationDelay: isIntersecting ? '300ms' : '0ms' }}
              >
                <a
                  href="/products"
                  className="btn-luxury group inline-flex"
                  style={{ borderColor: '#1A1A1A', color: '#1A1A1A' }}
                >
                  <span>View All Products</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ position: 'relative', zIndex: 1 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        )
      case 'testimonials':
        return <Testimonials key={sectionId} testimonials={testimonials} />
      case 'instagram_gallery':
        return <InstagramGallery key={sectionId} />
      case 'newsletter':
        return <Newsletter key={sectionId} />
      default:
        return null
    }
  }

  return (
    <>
      <Head>
        <title>Atelier — Luxury Fine Jewellery | Handcrafted Rings, Necklaces & More</title>
        <meta name="description" content="Discover exquisite handcrafted fine jewellery at Atelier. Shop luxury rings, necklaces, bracelets, and earrings crafted by master artisans with premium 18k gold and diamonds." />
        <meta name="keywords" content="fine jewellery, luxury jewelry, handcrafted rings, gold necklaces, diamond earrings, bracelets, artisan jewelry, 18k gold, premium accessories" />

        {/* Open Graph */}
        <meta property="og:title" content="Atelier — Luxury Fine Jewellery | Timeless Elegance" />
        <meta property="og:description" content="Fine jewellery handcrafted by master artisans. Shop rings, necklaces, bracelets and more with worldwide shipping." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_APP_URL || 'https://atelier-amber.vercel.app'} />

        {/* Twitter */}
        <meta name="twitter:title" content="Atelier — Luxury Fine Jewellery" />
        <meta name="twitter:description" content="Exquisite handcrafted fine jewellery. Shop luxury rings, necklaces, bracelets & earrings." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop" />

        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || 'https://atelier-amber.vercel.app'} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                "url": SITE_URL,
                "name": SITE_NAME,
                "description": "Exquisite handcrafted fine jewellery",
                "publisher": { "@id": `${SITE_URL}/#organization` },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${SITE_URL}/products?q={search_term_string}`
                  },
                  "query-input": "required name=search_term_string"
                }
              },
              {
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                "name": SITE_NAME,
                "url": SITE_URL,
                "logo": {
                  "@type": "ImageObject",
                  "url": `${SITE_URL}/atelier%20s.svg`,
                  "width": 512,
                  "height": 512
                },
                "description": "Luxury fine jewellery handcrafted by master artisans",
                "sameAs": [
                  INSTAGRAM_URL,
                  FACEBOOK_URL,
                  PINTEREST_URL
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "availableLanguage": "English"
                }
              },
              {
                "@type": "WebPage",
                "@id": `${SITE_URL}/#webpage`,
                "url": SITE_URL,
                "name": "Atelier — Luxury Fine Jewellery",
                "isPartOf": { "@id": `${SITE_URL}/#website` },
                "about": { "@id": `${SITE_URL}/#organization` },
                "description": "Shop luxury handcrafted fine jewellery including rings, necklaces, bracelets, and earrings"
              },
              {
                "@type": "ItemList",
                "name": "Featured Products",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "item": {
                      "@type": "Product",
                      "name": "Rings",
                      "url": `${SITE_URL}/products?category=rings`
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "item": {
                      "@type": "Product",
                      "name": "Necklaces",
                      "url": `${SITE_URL}/products?category=necklaces`
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "item": {
                      "@type": "Product",
                      "name": "Bracelets",
                      "url": `${SITE_URL}/products?category=bracelets`
                    }
                  },
                  {
                    "@type": "ListItem",
                    "position": 4,
                    "item": {
                      "@type": "Product",
                      "name": "Earrings",
                      "url": `${SITE_URL}/products?category=earrings`
                    }
                  }
                ]
              }
            ]
          })
        }} />
      </Head>

      <div className="min-h-screen bg-[#FAF9F6]">
        <Header />

        <main>
          {activeLayout.map((sectionId, index) => renderSection(sectionId, index))}
        </main>

        {/* 8. Footer - Minimal Luxury */}
        <Footer />
      </div>
    </>
  )
}
