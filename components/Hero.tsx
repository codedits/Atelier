import Image from 'next/image'
import { useState, useCallback, memo, useEffect } from 'react'
import Link from 'next/link'

export interface HeroImage {
  id: string
  title: string
  subtitle: string
  image_url: string
  video_url?: string
  cta_text: string
  cta_link: string
  display_order: number
}

interface HeroProps {
  heroImages?: HeroImage[]
}

const defaultHeroImages: HeroImage[] = [
  {
    id: 'default-1',
    title: 'Atelier',
    subtitle: 'Discover our collection of handcrafted jewelry',
    image_url: '/hero1.jpg',
    cta_text: 'Shop Now',
    cta_link: '/products',
    display_order: 0
  },
  {
    id: 'default-2',
    title: 'Atelier',
    subtitle: 'Discover our collection of handcrafted jewelry',
    image_url: '/pexels-iamluisao-20422966.jpg',
    cta_text: 'Shop Now',
    cta_link: '/products',
    display_order: 1
  },
  {
    id: 'default-3',
    title: 'Atelier',
    subtitle: 'Discover our collection of handcrafted jewelry',
    image_url: '/hero3.jpg',
    cta_text: 'Shop Now',
    cta_link: '/products',
    display_order: 2
  }
]

const Hero = memo(function Hero({ heroImages: initialHeroImages }: HeroProps) {
  const heroImages = initialHeroImages && initialHeroImages.length > 0 ? initialHeroImages : defaultHeroImages
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [heroImages.length])

  const handleScrollDown = useCallback(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({
      top: window.innerHeight,
      behavior: isReduced ? 'auto' : 'smooth'
    })
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleScrollDown()
  }, [handleScrollDown])

  const hero = heroImages[currentImageIndex]

  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden bg-black">
      {/* Background Image — zoom-out entrance */}
      <div className={`absolute inset-0 w-full h-full ${isLoaded ? 'animate-image-entrance' : 'opacity-0'}`}>
        {heroImages.map((img, index) => (
          <div
            key={img.id || index}
            className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={img.image_url}
              alt={index === 0 ? img.title : `${img.title} background ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              sizes="100vw"
              quality={75}
              onLoad={index === 0 ? () => setIsLoaded(true) : undefined}
            />
          </div>
        ))}

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/40 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-[2]" />
      </div>

      {/* Content — staggered text reveal */}
      <div className={`relative z-10 flex flex-col items-center justify-center h-full text-center text-white ${isLoaded ? 'is-visible' : ''}`}>
        {/* Subtitle */}
        <p className="hero-subtext text-[11px] sm:text-xs tracking-[0.3em] uppercase text-white/70 mb-6">
          {hero.subtitle}
        </p>

        {/* Title */}
        <h1 className="hero-text hero-title">
          {hero.title}
        </h1>

        {/* CTAs */}
        <div className="hero-cta flex flex-col sm:flex-row items-center gap-4 mt-12">
          {hero.cta_text && (
            <Link
              href={hero.cta_link || '/products'}
              className="group inline-flex items-center gap-3 px-10 py-4 bg-white text-black text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-white/90 transition-all duration-300"
            >
              <span>{hero.cta_text}</span>
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          )}
          <Link
            href="/about"
            className="inline-flex items-center gap-3 px-10 py-4 border border-white/40 text-white text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/60 transition-all duration-300"
          >
            <span>Our Story</span>
          </Link>
        </div>
      </div>

      {/* Slide indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`transition-all duration-500 ${
                index === currentImageIndex
                  ? 'w-8 h-[2px] bg-white'
                  : 'w-4 h-[1px] bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-20 hero-scroll-indicator"
        onClick={handleScrollDown}
        role="button"
        tabIndex={0}
        aria-label="Scroll down"
        onKeyDown={handleKeyDown}
      >
        <span className="text-[10px] text-white/50 uppercase tracking-[0.3em]">
          Scroll
        </span>
        <div className="w-px h-8 bg-gradient-to-b from-white/70 to-transparent hero-bounce" />
      </div>
    </section>
  )
})

export default Hero
