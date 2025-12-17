import { useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useState, useCallback } from 'react'

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

const defaultHero: HeroImage = {
  id: 'default',
  title: 'Atelier',
  subtitle: '',
  image_url: '/pexels-coppertist-wu-313365563-15691504.jpg',
  video_url: '',
  cta_text: 'Shop Women',
  cta_link: '/products?gender=women',
  display_order: 0
}

export default function Hero() {
  const prefersReducedMotion = useReducedMotion()
  const [heroImage] = useState<HeroImage>(defaultHero)

  // Memoized scroll handler
  const handleShopNowClick = useCallback(() => {
    const el = typeof document !== 'undefined' ? document.getElementById('categories') : null
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
    } else {
      window.location.href = '/products'
    }
  }, [prefersReducedMotion])

  const handleScrollDown = useCallback(() => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
  }, [prefersReducedMotion])

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-[#0A0A0A]">
      {/* Inline styles for hero-specific animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes heroZoom { from { transform: scale(1.05); } to { transform: scale(1); } }
        @keyframes heroFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        .hero-zoom { animation: heroZoom 1.6s ease-out forwards; }
        .hero-fade { animation: heroFadeIn 0.85s ease-out forwards; }
        .hero-fade-delay { animation: heroFadeIn 0.8s ease-out 0.18s forwards; opacity: 0; }
        .hero-bounce { animation: heroBounce 1.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-zoom, .hero-fade, .hero-fade-delay { animation: none; opacity: 1; transform: none; }
          .hero-bounce { animation: none; }
        }
      `}} />
      
      {/* Background with subtle initial zoom */}
      <div className={`absolute inset-0 ${prefersReducedMotion ? '' : 'hero-zoom'}`}>
        {heroImage.video_url ? (
          <video
            src={heroImage.video_url}
            poster={heroImage.image_url || undefined}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
            aria-hidden
          />
        ) : heroImage.image_url ? (
          <Image 
            src={heroImage.image_url} 
            alt={heroImage.title} 
            fill 
            className="object-cover" 
            priority 
            sizes="100vw"
            quality={85}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A]" />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Overlay content - Centered Heading Only */}
      <div className="relative h-full flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className={`mx-auto ${prefersReducedMotion ? '' : 'hero-fade'}`}>
            <div className="relative mx-auto w-36 sm:w-48 md:w-56 lg:w-72 xl:w-80 h-auto">
              <img 
                src={encodeURI('/atelier s.svg')} 
                alt={heroImage.title} 
                className="w-full h-auto mx-auto" 
                loading="eager"
              />
            </div>
          </div>

          <button
            type="button"
            aria-label="Shop now - go to categories"
            onClick={handleShopNowClick}
            className={`mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 px-3 py-1.5 border border-white/10 rounded-md bg-transparent hover:bg-white/5 hover:-translate-y-0.5 active:scale-[0.985] transition-all duration-150 mx-auto ${prefersReducedMotion ? '' : 'hero-fade-delay'}`}
          >
            <span>Shop Now</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4l6 6-6 6" />
            </svg>
          </button>

          {heroImage.subtitle && (
            <p className={`mt-4 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-normal ${prefersReducedMotion ? '' : 'hero-fade-delay'}`}>
              {heroImage.subtitle}
            </p>
          )}

          {/* Subtle accent */}
          <div className={`mt-6 mx-auto w-16 h-[2px] bg-white/15 rounded ${prefersReducedMotion ? '' : 'hero-fade-delay'}`} />
        </div>
      </div>

      {/* Scroll Down Arrow */}
      <div 
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 cursor-pointer ${prefersReducedMotion ? '' : 'hero-fade hero-bounce'}`}
        onClick={handleScrollDown}
        role="button"
        tabIndex={0}
        aria-label="Scroll down"
        onKeyDown={(e) => e.key === 'Enter' && handleScrollDown()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
    </section>
  )
}
