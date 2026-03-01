import { memo } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import Image from 'next/image'
import Link from 'next/link'

interface Collection {
  id: string
  title: string
  description?: string
  image_url: string
  link: string
  display_order: number
}

interface FeaturedCollectionsProps {
  collections: Collection[]
}

const FeaturedCollections = memo(function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver()

  return (
    <section className="luxury-section bg-[#FAF9F6] overflow-hidden" ref={sectionRef}>
      <div className="w-full mx-auto px-6 lg:px-8 max-w-7xl">
        {/* Section header */}
        <div
          className={cn(
            "text-center mb-16 md:mb-20 invisible-before-reveal",
            isIntersecting && "reveal-slide-up"
          )}
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#1A1A1A] mb-4">
            Collections
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#1A1A1A] mb-6">
            Shop by Category
          </h2>
          <div className="luxury-divider mt-6">
            <div className="luxury-divider-diamond" />
          </div>
        </div>
      </div>

      {/* Full-bleed editorial grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#E8E4DF]">
        {collections.map((collection, index) => (
          <div
            key={collection.id}
            className={cn(
              "will-change-transform invisible-before-reveal",
              isIntersecting && "reveal-fade-in"
            )}
            style={{ animationDelay: isIntersecting ? `${index * 100}ms` : '0ms' }}
          >
            <Link
              href={collection.link}
              className="group relative overflow-hidden block h-[45vh] md:h-[65vh] lg:h-[130vh] w-full cursor-pointer bg-[#FAF9F6]"
            >
              <Image
                src={collection.image_url}
                alt={collection.title}
                fill
                className="object-cover transition-all duration-[1200ms] ease-out group-hover:scale-105"
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 50vw"
              />

              {/* Refined gradient overlay - Darker for mobile centering readability */}
              <div className="absolute inset-0 bg-black/30 lg:bg-gradient-to-t lg:from-black/60 lg:via-black/10 lg:to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-700" />

              {/* Content - Absolute center on mobile, bottom on desktop */}
              <div className="absolute inset-0 flex flex-col items-center justify-center lg:justify-end p-4 md:p-10">
                <div className="text-center w-full">
                  {/* Gold accent line */}
                  <div className="hidden lg:block w-8 h-px bg-white mx-auto mb-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />

                  <h3 className="text-xl md:text-2xl lg:text-3xl font-medium !text-white mb-2 lg:mb-4 tracking-wide font-serif">
                    {collection.title}
                  </h3>

                  <div className="flex flex-col items-center justify-center lg:flex lg:opacity-100 opacity-60">
                    <span className="text-white/80 text-[10px] lg:text-xs font-medium uppercase tracking-[0.2em] mb-1 transition-all duration-500 group-hover:-translate-y-1">Discover</span>
                    <svg className="hidden lg:block w-3 h-3 text-white/50 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
})

export default FeaturedCollections
