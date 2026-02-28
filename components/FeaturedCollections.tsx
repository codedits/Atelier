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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[#E8E4DF]">
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
              className="group relative overflow-hidden block h-screen w-full cursor-pointer bg-[#FAF9F6]"
            >
              <Image
                src={collection.image_url}
                alt={collection.title}
                fill
                className="object-cover transition-all duration-[1200ms] ease-out group-hover:scale-105"
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
              />

              {/* Refined gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-700" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 md:p-10">
                <div className="text-center w-full">
                  {/* Gold accent line */}
                  <div className="w-8 h-px bg-white mx-auto mb-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />

                  <h3 className="text-2xl md:text-3xl font-medium !text-white mb-4 tracking-wide font-serif">
                    {collection.title}
                  </h3>

                  <div className="flex items-center justify-center gap-2 text-white/80 text-xs font-medium uppercase tracking-[0.2em] group-hover:gap-3 transition-all duration-500">
                    <span>Discover</span>
                    <svg className="w-3 h-3 group-hover:translate-x-1.5 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
