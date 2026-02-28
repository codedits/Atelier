import Image from 'next/image'
import { useState, useCallback, memo, useEffect, useRef } from 'react'
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

// Animated counter hook
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!start) return
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, start])

  return count
}

const Hero = memo(function Hero({ heroImages: initialHeroImages }: HeroProps) {
  const heroImages = initialHeroImages && initialHeroImages.length > 0 ? initialHeroImages : defaultHeroImages
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [progressWidth, setProgressWidth] = useState(0)

  const years = useCountUp(35, 2200, isLoaded)
  const pieces = useCountUp(5000, 2500, isLoaded)
  const artisans = useCountUp(12, 1800, isLoaded)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) return

    const SLIDE_DURATION = 6000
    let start = Date.now()

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start
      setProgressWidth(Math.min((elapsed / SLIDE_DURATION) * 100, 100))
    }, 50)

    const slideInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
      start = Date.now()
      setProgressWidth(0)
    }, SLIDE_DURATION)

    return () => {
      clearInterval(slideInterval)
      clearInterval(progressInterval)
    }
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-[2]" />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6 ${isLoaded ? 'is-visible' : ''}`}>
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

        {/* Animated Stats Row */}
        <div className="hero-cta mt-16 sm:mt-20 flex items-center gap-8 sm:gap-14">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-light tracking-wide text-white font-serif">{years}+</div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/50 mt-1">Years</div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-light tracking-wide text-white font-serif">{pieces.toLocaleString()}+</div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/50 mt-1">Pieces Created</div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-light tracking-wide text-white font-serif">{artisans}</div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/50 mt-1">Master Artisans</div>
          </div>
        </div>
      </div>

      {/* Progress bar for current slide */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index)
                setProgressWidth(0)
              }}
              className="relative overflow-hidden transition-all duration-500"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className={`transition-all duration-500 ${
                index === currentImageIndex
                  ? 'w-10 h-[2px] bg-white/30'
                  : 'w-4 h-[1px] bg-white/40 hover:bg-white/60'
              }`} />
              {index === currentImageIndex && (
                <div
                  className="absolute top-0 left-0 h-full bg-white transition-none"
                  style={{ width: `${progressWidth}%` }}
                />
              )}
            </button>
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
