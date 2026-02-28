import { memo } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import Image from 'next/image'
import Link from 'next/link'

interface Highlight {
  id: string
  title: string
  subtitle: string
  image: string
  link: string
  badge?: string
  color?: string
}

interface CollectionsHighlightProps {
  highlights?: Highlight[]
}

const defaultHighlights: Highlight[] = [
  {
    id: '1',
    title: 'Engagement Rings',
    subtitle: 'Timeless symbols of eternal love',
    image: 'https://images.unsplash.com/photo-1588814096146-e7c56156f9f8?q=80&w=1280&auto=format&fit=crop',
    link: '/products?category=rings',
    badge: 'New',
    color: '#1A1A1A'
  },
  {
    id: '2',
    title: 'Fine Necklaces',
    subtitle: 'Elegantly crafted for every moment',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=1280&auto=format&fit=crop',
    link: '/products?category=necklaces',
    badge: 'Bestseller',
    color: '#1A1A1A'
  },
  {
    id: '3',
    title: 'Statement Pieces',
    subtitle: 'Bold designs that make an impression',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1280&auto=format&fit=crop',
    link: '/products',
    badge: 'Limited',
    color: '#1A1A1A'
  }
]

const CollectionsHighlight = memo(function CollectionsHighlight({ highlights = defaultHighlights }: CollectionsHighlightProps) {
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver()

  return (
    <section className="luxury-section bg-white w-full overflow-hidden" ref={sectionRef}>
      <div className="w-full mx-auto px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div
          className={cn(
            "text-center mb-16 md:mb-20 invisible-before-reveal",
            isIntersecting && "reveal-slide-up"
          )}
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#1A1A1A] mb-4">
            Curated Collections
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#1A1A1A] mb-6">
            Discover What&apos;s Special
          </h2>
          <div className="luxury-divider mt-6">
            <div className="luxury-divider-diamond" />
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-8">
          {highlights.map((highlight, index) => (
            <div
              key={highlight.id}
              className={cn(
                "group h-full invisible-before-reveal",
                isIntersecting && "reveal-slide-up"
              )}
              style={{ animationDelay: isIntersecting ? `${index * 150}ms` : '0ms' }}
            >
              <Link href={highlight.link} className="flex flex-col h-full group">
                {/* Image Container */}
                <div className="relative overflow-hidden aspect-[3/4] mb-8 bg-[#F5F0EB]">
                  <Image
                    src={highlight.image}
                    alt={highlight.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-all duration-[1000ms] ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Badge */}
                  {highlight.badge && (
                    <div
                      className={cn(
                        "absolute top-5 left-5 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] border invisible-before-reveal",
                        isIntersecting && "reveal-fade-in"
                      )}
                      style={{
                        animationDelay: isIntersecting ? `${index * 150 + 200}ms` : '0ms',
                        borderColor: '#1A1A1A',
                        color: '#FFFFFF',
                        background: 'rgba(26,26,26,0.85)',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      {highlight.badge}
                    </div>
                  )}

                  {/* Hover overlay with gold border */}
                  <div className="absolute inset-0 border border-transparent group-hover:border-[#1A1A1A]/40 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-2xl md:text-3xl font-medium text-[#1A1A1A] mb-3 tracking-wide font-serif">
                    {highlight.title}
                  </h3>
                  <p className="text-[#6B6B6B] text-sm leading-relaxed mb-5 flex-1">
                    {highlight.subtitle}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm group-hover:gap-3 transition-all duration-500">
                    <span>Explore</span>
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={cn(
            "text-center mt-16 md:mt-20 invisible-before-reveal",
            isIntersecting && "reveal-slide-up"
          )}
          style={{ animationDelay: isIntersecting ? '400ms' : '0ms' }}
        >
          <Link
            href="/products"
            className="btn-luxury group"
          >
            <span>View All Collections</span>
            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
})

export default CollectionsHighlight
