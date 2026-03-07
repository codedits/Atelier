/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Header from '@/components/Header'
import Hero, { HeroImage } from '@/components/Hero'
import ProductCard from '@/components/ProductCard'
import FeaturedCollections from '@/components/FeaturedCollections'
import LogoMarquee from '@/components/LogoMarquee'
import Lookbook from '@/components/Lookbook'
import { Testimonial } from '@/components/Testimonials'
import { Skeleton } from '@/components/ui/Skeleton'

const AnnouncementBanner = dynamic(() => import('@/components/AnnouncementBanner'), { ssr: true })
const FeatureVideo = dynamic(() => import('@/components/FeatureVideo'), { ssr: true })
const ValueProposition = dynamic(() => import('@/components/ValueProposition'), { ssr: true })
const TrendingNow = dynamic(() => import('@/components/TrendingNow'), { ssr: true })
const BrandStory = dynamic(() => import('@/components/BrandStory'), { ssr: true })
const ProcessSteps = dynamic(() => import('@/components/ProcessSteps'), { ssr: true })
const Craftsmanship = dynamic(() => import('@/components/Craftsmanship'), { ssr: true })
const Testimonials = dynamic(() => import('@/components/Testimonials'), { ssr: true })
const InstagramGallery = dynamic(() => import('@/components/InstagramGallery'), { ssr: true })
const LimitedDrop = dynamic(() => import('@/components/LimitedDrop'), { ssr: true })
const Newsletter = dynamic(() => import('@/components/Newsletter'), { ssr: true })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: true })

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

interface HomeClientPageProps {
  newArrivals: Product[]
  featuredProducts: Product[]
  featuredCollections: Collection[]
  layout: string[]
  heroImages: HeroImage[]
  testimonials: Testimonial[]
  siteConfig: any
  announcements: any[]
  homepageSections: any[]
  lookbookImages: { id: string, image_url: string, title?: string, subtitle?: string, link?: string }[]
}

export default function HomeClientPage({
  newArrivals,
  featuredProducts,
  featuredCollections,
  layout,
  heroImages,
  testimonials,
  announcements,
  homepageSections,
  siteConfig,
  lookbookImages,
}: HomeClientPageProps) {
  const products = newArrivals
  const featured = featuredProducts
  const collections = featuredCollections

  const sectionsByKey = useMemo(() => {
    const map: Record<string, any> = {}
    for (const section of homepageSections || []) {
      if (section.section_key) map[section.section_key] = section
    }
    return map
  }, [homepageSections])

  const { ref: sectionRef, isIntersecting } = useIntersectionObserver()

  const activeLayout = useMemo(() => {
    let currentLayout = layout && layout.length > 0
      ? layout
      : [
        'hero', 'feature_video', 'limited_drop', 'announcement_banner', 'value_proposition', 'featured_collections', 'logo_marquee',
        'process_steps', 'lookbook', 'trending_now', 'craftsmanship', 'new_arrivals', 'testimonials', 'instagram_gallery', 'newsletter',
      ]

    if (!currentLayout.includes('lookbook')) {
      currentLayout = [...currentLayout]
      const trendingIndex = currentLayout.indexOf('trending_now')
      if (trendingIndex !== -1) {
        currentLayout.splice(trendingIndex, 0, 'lookbook')
      } else {
        currentLayout.push('lookbook')
      }
    }
    return currentLayout
  }, [layout])

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return <Hero key={sectionId} heroImages={heroImages} overlay={siteConfig?.features?.hero?.overlay} />
      case 'feature_video':
        return <FeatureVideo key={sectionId} data={sectionsByKey['feature_video']} />
      case 'announcement_banner':
        return <AnnouncementBanner key={sectionId} announcements={announcements?.length ? announcements : undefined} />
      case 'value_proposition':
        return <ValueProposition key={sectionId} />
      case 'featured_collections':
        return <FeaturedCollections key={sectionId} collections={collections} />
      case 'logo_marquee':
        return <LogoMarquee key={sectionId} />
      case 'process_steps':
        return <ProcessSteps key={sectionId} data={sectionsByKey['process_steps']} />
      case 'lookbook':
        return <Lookbook key={sectionId} images={lookbookImages} title={sectionsByKey['lookbook']?.title} subtitle={sectionsByKey['lookbook']?.subtitle} />
      case 'trending_now':
        return featured.length > 0 ? <TrendingNow key={sectionId} products={featured} /> : null
      case 'craftsmanship':
        return <Craftsmanship key={sectionId} data={sectionsByKey['craftsmanship']} />
      case 'brand_story':
        return <BrandStory key={sectionId} data={sectionsByKey['brand_story']} />
      case 'limited_drop':
        return <LimitedDrop key={sectionId} data={sectionsByKey['limited_drop']} />
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
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-10">
                  {products.map((product, productIndex) => (
                    <div
                      key={product.id}
                      className={cn(
                        "will-change-transform invisible-before-reveal min-h-[400px]",
                        isIntersecting && "reveal-slide-up"
                      )}
                      style={{ animationDelay: isIntersecting ? `${productIndex * 120}ms` : '0ms' }}
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
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-10">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex flex-col space-y-4">
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
                <Link
                  href="/products"
                  className="btn-luxury group inline-flex"
                  style={{ borderColor: '#1A1A1A', color: '#1A1A1A' }}
                >
                  <span>View All Products</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ position: 'relative', zIndex: 1 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
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
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header />

      <main>
        {activeLayout.map((sectionId) => renderSection(sectionId))}
      </main>

      <Footer />
    </div>
  )
}
