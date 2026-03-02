import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import Image from 'next/image'

interface Milestone {
  year: string
  text: string
}

interface BrandStoryImage {
  url: string
  alt: string
  caption?: string
}

interface BrandStoryData {
  title?: string
  subtitle?: string
  content?: string
  image_url?: string
  metadata?: {
    highlight_word?: string
    milestones?: Milestone[]
    images?: BrandStoryImage[]
    cta_text?: string
    cta_link?: string
  }
}

interface BrandStoryProps {
  data?: BrandStoryData
}

const defaultData: BrandStoryData = {
  title: 'Where tradition meets modern artistry',
  subtitle: 'Our Story',
  content: 'Every piece begins as a sketch and is brought to life by artisans who have perfected their craft over decades.',
  image_url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=1600&auto=format&fit=crop',
  metadata: {
    highlight_word: 'modern artistry',
    milestones: [
      { year: '2018', text: 'Founded with a vision to revive artisan craftsmanship' },
      { year: '2020', text: 'First flagship atelier opened in the heart of the city' },
      { year: '2022', text: 'Expanded to over 500 bespoke creations delivered worldwide' },
      { year: '2024', text: 'Introduced sustainable sourcing across all precious metals' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop', alt: 'Jewellery crafting process', caption: 'Hand setting each stone' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop', alt: 'Finished luxury piece', caption: 'The finished masterpiece' },
    ],
    cta_text: 'Discover Our Full Story',
    cta_link: '/about',
  }
}

export default function BrandStory({ data: propData }: BrandStoryProps) {
  const d = { ...defaultData, ...propData, metadata: { ...defaultData.metadata, ...propData?.metadata } }
  const milestones = d.metadata?.milestones || defaultData.metadata!.milestones!
  const images = d.metadata?.images || defaultData.metadata!.images!
  const highlightWord = d.metadata?.highlight_word || 'modern artistry'
  const ctaText = d.metadata?.cta_text || 'Discover Our Full Story'
  const ctaLink = d.metadata?.cta_link || '/about'

  // Render title with highlight word
  const renderTitle = () => {
    const title = d.title || defaultData.title!
    if (!highlightWord || !title.includes(highlightWord)) {
      return <>{title}</>
    }
    const parts = title.split(highlightWord)
    return <>{parts[0]}<span className="italic text-[#C9A96E]">{highlightWord}</span>{parts[1]}</>
  }
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver({ threshold: 0.15 })
  const containerRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!isIntersecting) return
    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const progress = Math.max(0, Math.min(1, -rect.top / rect.height))
        // Write transforms directly to DOM — no setState re-renders
        if (bgRef.current) {
          bgRef.current.style.transform = `translateY(${progress * -40}px)`
        }
        imageRefs.current.forEach((el, i) => {
          if (!el) return
          el.style.transform = `translateY(${progress * (i % 2 === 0 ? 20 : -15)}px)`
        })
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [isIntersecting])

  return (
    <section
      ref={(el) => {
        // Merge refs
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
        (containerRef as React.MutableRefObject<HTMLElement | null>).current = el
      }}
      className="relative overflow-hidden bg-[#1A1A1A]"
    >
      {/* Parallax background image */}
      <div
        ref={bgRef}
        className="absolute inset-0"
      >
        <Image
          src={d.image_url || defaultData.image_url!}
          alt="Artisan craftsmanship"
          fill
          className="object-cover opacity-20"
          sizes="100vw"
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-transparent to-[#1A1A1A]" />

      <div className="relative z-10 py-24 md:py-32 lg:py-40">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          {/* Top section: big statement */}
          <div
            className={cn(
              'text-center mb-20 md:mb-28 invisible-before-reveal',
              isIntersecting && 'reveal-fade-in'
            )}
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C9A96E] mb-6">{d.subtitle}</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium text-white leading-tight max-w-3xl mx-auto">
              {renderTitle()}
            </h2>
            <p className="mt-6 text-sm md:text-base text-white/50 max-w-xl mx-auto leading-relaxed">
              {d.content}
            </p>
          </div>

          {/* Middle: side-by-side images with parallax offset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-20 md:mb-28">
            {images.map((img, i) => (
              <div
                key={i}
                ref={(el) => { imageRefs.current[i] = el }}
                className={cn(
                  'relative h-[350px] md:h-[450px] overflow-hidden invisible-before-reveal',
                  isIntersecting && 'reveal-slide-up'
                )}
                style={{
                  animationDelay: `${200 + i * 200}ms`,
                }}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {img.caption && (
                  <p className="absolute bottom-6 left-6 text-[10px] uppercase tracking-[0.2em] text-white/80">
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Bottom: timeline milestones */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-px" />

              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  className={cn(
                    'relative flex items-start gap-6 mb-10 last:mb-0 invisible-before-reveal',
                    isIntersecting && 'reveal-slide-up',
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  )}
                  style={{ animationDelay: `${600 + i * 150}ms` }}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 top-1 w-2 h-2 bg-[#C9A96E] rounded-full -translate-x-1/2 z-10 md:-translate-x-1/2" />

                  {/* Content */}
                  <div className={cn(
                    'ml-10 md:ml-0 md:w-1/2',
                    i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'
                  )}>
                    <span className="text-[#C9A96E] font-serif text-2xl font-medium">{m.year}</span>
                    <p className="text-white/60 text-sm mt-1 leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div
            className={cn(
              'text-center mt-16 md:mt-24 invisible-before-reveal',
              isIntersecting && 'reveal-fade-in'
            )}
            style={{ animationDelay: '1200ms' }}
          >
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/70 hover:text-[#C9A96E] transition-colors border-b border-white/20 pb-1 hover:border-[#C9A96E]"
            >
              <span>{ctaText}</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
