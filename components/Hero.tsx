import { useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useState, useCallback, memo, useEffect } from 'react'
import Link from 'next/link'

interface HeroImage {
  id: string
  title: string
  subtitle: string
  image_url: string
  video_url?: string
  cta_text: string
  cta_link: string
  display_order: number
}

const heroImages = [
  '/hero1.jpg',
  '/hero2.jpg',
  '/hero3.jpg'
]

const defaultHero: HeroImage = {
  id: 'default',
  title: 'Atelier',
  subtitle: 'Timeless elegance, crafted for you',
  image_url: heroImages[0],
  video_url: '',
  cta_text: 'Explore Collection',
  cta_link: '/products',
  display_order: 0
}

const Hero = memo(function Hero() {
  const prefersReducedMotion = useReducedMotion()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [heroImage, setHeroImage] = useState<HeroImage>(defaultHero)

  // Rotate images every 5 seconds
  useEffect(() => {
    if (prefersReducedMotion) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  // Update hero image when index changes
  useEffect(() => {
    setHeroImage((prev) => ({
      ...prev,
      image_url: heroImages[currentImageIndex]
    }))
  }, [currentImageIndex])

  // Optimized scroll handler

  const handleScrollDown = useCallback(() => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
  }, [prefersReducedMotion])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleScrollDown()
  }, [handleScrollDown])

  return (
    <section className="relative h-screen md:min-h-[600px] overflow-hidden bg-[#0A0A0A]">
      {/* Background image carousel with smooth fade transition */}
      <div className="absolute inset-0 overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            } ${prefersReducedMotion ? '' : 'hero-zoom'}`}
          >
            <Image
              src={image}
              alt={`Hero background ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
              quality={85}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>

      {/* Overlay content - Centered Heading Only */}
      <div className="relative h-screen flex flex-col items-center justify-center md:justify-start md:pt-20 px-4">
        <div className="w-full text-center px-4">
          <div className={`mx-auto ${prefersReducedMotion ? '' : 'hero-fade'}`}>
            <h1 className="hero-title">
              {heroImage.title}
            </h1>
          </div>

          {heroImage.subtitle && (
            <p className={`mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light tracking-wide ${prefersReducedMotion ? '' : 'hero-fade-delay'}`}>
              {heroImage.subtitle}
            </p>
          )}

          <div className={`flex flex-col sm:flex-row gap-4 justify-center mt-6 sm:mt-8 ${prefersReducedMotion ? '' : 'hero-fade-delay'}`}>
            <Link
              href={heroImage.cta_link}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1A1A1A] font-medium rounded-lg hover:bg-[#F5F5F5] hover:-translate-y-0.5 active:scale-[0.985] transition-all duration-150"
            >
              {heroImage.cta_text}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4l6 6-6 6" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 hover:-translate-y-0.5 active:scale-[0.985] transition-all duration-150"
            >
              Our Story
            </Link>
          </div>

          {/* Subtle accent */}
          <div className={`mt-8 sm:mt-10 mx-auto w-16 h-[2px] bg-white/15 rounded ${prefersReducedMotion ? '' : 'hero-fade-delay'}`} />
        </div>
      </div>

      {/* Scroll Down Arrow */}
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 cursor-pointer ${prefersReducedMotion ? '' : 'hero-fade hero-bounce'}`}
        onClick={handleScrollDown}
        role="button"
        tabIndex={0}
        aria-label="Scroll down"
        onKeyDown={handleKeyDown}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </section>
  )
})

export default Hero
