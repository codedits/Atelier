import { memo } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import Image from 'next/image'
import { INSTAGRAM_URL } from '@/lib/constants'

const instagramImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?q=80&w=600&auto=format&fit=crop',
    alt: 'Elegant diamond ring on display'
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop',
    alt: 'Gold necklace styling'
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop',
    alt: 'Jewelry workshop craftsmanship'
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
    alt: 'Stacked gold rings'
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&auto=format&fit=crop',
    alt: 'Bracelet collection'
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1619119069152-a2b331eb392a?q=80&w=600&auto=format&fit=crop',
    alt: 'Pearl earrings'
  }
]

const InstagramGallery = memo(function InstagramGallery() {
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver()

  return (
    <section className="luxury-section bg-[#FAF9F6] text-[#1A1A1A] w-full overflow-hidden" ref={sectionRef}>
      <div className="w-full mx-auto px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div
          className={cn(
            "text-center mb-16 md:mb-20 invisible-before-reveal",
            isIntersecting && "reveal-slide-up"
          )}
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-8 h-px bg-[#1A1A1A]" />
            <span className="text-[11px] text-[#1A1A1A] font-medium uppercase tracking-[0.3em]">
              @atelierjewellery
            </span>
            <div className="w-8 h-px bg-[#1A1A1A]" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#1A1A1A] mb-6 font-serif">
            Follow Our Journey
          </h2>
          <p className="text-sm text-[#4A4A4A] max-w-md mx-auto">
            Behind-the-scenes, styling inspiration, and moments of beauty.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          {instagramImages.map((image, index) => (
            <a
              key={image.id}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative aspect-square overflow-hidden cursor-pointer invisible-before-reveal",
                isIntersecting && "reveal-scale-up"
              )}
              style={{ animationDelay: isIntersecting ? `${index * 80}ms` : '0ms' }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-110 transition-all duration-[800ms] ease-out"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              {/* Luxury hover overlay with gold accent */}
              <div className="absolute inset-0 bg-[#0A0A0A]/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              {/* Gold border on hover */}
              <div className="absolute inset-0 border border-[#1A1A1A]/0 group-hover:border-[#1A1A1A]/40 transition-all duration-500 pointer-events-none" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <div
          className={cn(
            "text-center mt-14 invisible-before-reveal",
            isIntersecting && "reveal-slide-up"
          )}
          style={{ animationDelay: isIntersecting ? '400ms' : '0ms' }}
        >
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-luxury group inline-flex"
            style={{ borderColor: '#1A1A1A', color: '#1A1A1A' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ position: 'relative', zIndex: 1 }}>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
            </svg>
            <span>Follow Us on Instagram</span>
          </a>
        </div>
      </div>
    </section>
  )
})

export default InstagramGallery
