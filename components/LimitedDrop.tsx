import { useState, useEffect, memo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface LimitedDropData {
  title?: string
  subtitle?: string
  content?: string
  image_url?: string
  metadata?: {
    target_date?: string
    total_pieces?: number
    cta_text?: string
    cta_link?: string
    badge_text?: string
  }
}

interface LimitedDropProps {
  data?: LimitedDropData
}

const defaultData: LimitedDropData = {
  title: 'The Midnight Collection',
  subtitle: 'Limited Edition',
  content: 'An exclusive capsule of 48 hand-finished pieces, each uniquely numbered. Once they\'re gone, they\'re gone.',
  image_url: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=1200&auto=format&fit=crop',
  metadata: {
    target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    total_pieces: 48,
    cta_text: 'Reserve Yours',
    cta_link: '/products',
    badge_text: 'Dropping Soon',
  }
}

function useCountdown(targetDate: string) {
  const calcTimeLeft = useCallback(() => {
    const diff = new Date(targetDate).getTime() - Date.now()
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      expired: false,
    }
  }, [targetDate])

  const [time, setTime] = useState(calcTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => setTime(calcTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [calcTimeLeft])

  return time
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="relative">
        <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-[#1A1A1A] font-serif tabular-nums leading-none">
          {String(value).padStart(2, '0')}
        </div>
      </div>
      <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A]/70 mt-3">
        {label}
      </div>
    </div>
  )
}

const LimitedDrop = memo(function LimitedDrop({ data: propData }: LimitedDropProps) {
  if (!propData || (propData as any).is_active === false) return null
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const d = { ...defaultData, ...propData, metadata: { ...defaultData.metadata, ...propData?.metadata } }
  const meta = d.metadata!
  const countdown = useCountdown(meta.target_date || defaultData.metadata!.target_date!)
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver({ threshold: 0.15 })

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#FAF9F6]"
    >
      {/* Two-column layout: Image + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] lg:min-h-[700px]">

        {/* Left: Product Image */}
        <div className="relative h-[400px] sm:h-[500px] lg:h-auto overflow-hidden">
          <Image
            src={d.image_url || defaultData.image_url!}
            alt={d.title || 'Limited edition'}
            fill
            className={cn(
              'object-cover transition-transform duration-[2000ms] ease-out',
              isIntersecting ? 'scale-100' : 'scale-110'
            )}
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          {/* Overlay gradient toward content side */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#FAF9F6]/40 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FAF9F6]/40 lg:hidden" />

          {/* Badge */}
          {meta.badge_text && (
            <div
              className={cn(
                'absolute top-8 left-8 invisible-before-reveal',
                isIntersecting && 'reveal-fade-in'
              )}
            >
              <div className="flex items-center gap-2 bg-[#1A1A1A]/70 backdrop-blur-md border border-[#1A1A1A]/10 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-[#C9A96E] rounded-full animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-white font-medium">
                  {meta.badge_text}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="relative flex flex-col items-center lg:items-start justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-16 lg:py-24">

          {/* Decorative vertical line */}
          <div
            className={cn(
              'hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-0 bg-gradient-to-b from-transparent via-[#C9A96E]/30 to-transparent transition-all duration-[1500ms]',
              isIntersecting && 'h-40'
            )}
          />

          {/* Subtitle */}
          <p
            className={cn(
              'text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#C9A96E] mb-6 invisible-before-reveal',
              isIntersecting && 'reveal-fade-in'
            )}
          >
            {d.subtitle}
          </p>

          {/* Title */}
          <h2
            className={cn(
              'text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-serif font-medium text-[#1A1A1A] leading-[1.1] mb-6 text-center lg:text-left invisible-before-reveal',
              isIntersecting && 'reveal-slide-up'
            )}
            style={{ animationDelay: '150ms' }}
          >
            {d.title}
          </h2>

          {/* Description */}
          <p
            className={cn(
              'text-sm sm:text-base text-[#1A1A1A]/80 leading-relaxed max-w-md mb-10 text-center lg:text-left invisible-before-reveal',
              isIntersecting && 'reveal-slide-up'
            )}
            style={{ animationDelay: '300ms' }}
          >
            {d.content}
          </p>

          {/* Pieces count */}
          {meta.total_pieces && (
            <div
              className={cn(
                'flex items-center gap-3 mb-12 invisible-before-reveal',
                isIntersecting && 'reveal-fade-in'
              )}
              style={{ animationDelay: '400ms' }}
            >
              <div className="h-px w-8 bg-[#C9A96E]/60" />
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A]/80">
                Only <span className="text-[#C9A96E] font-medium">{meta.total_pieces}</span> pieces worldwide
              </span>
              <div className="h-px w-8 bg-[#C9A96E]/60" />
            </div>
          )}

          {/* Countdown */}
          <div
            className={cn(
              'invisible-before-reveal transition-opacity duration-700',
              isIntersecting && 'reveal-slide-up',
              !mounted && 'opacity-0'
            )}
            style={{ animationDelay: '500ms' }}
          >
            {!mounted || !countdown.expired ? (
              <div className="flex items-center gap-6 sm:gap-8 md:gap-10">
                <CountdownUnit value={mounted ? countdown.days : 0} label="Days" />
                <div className="text-2xl sm:text-3xl text-[#1A1A1A]/40 font-light -mt-5">:</div>
                <CountdownUnit value={mounted ? countdown.hours : 0} label="Hours" />
                <div className="text-2xl sm:text-3xl text-[#1A1A1A]/40 font-light -mt-5">:</div>
                <CountdownUnit value={mounted ? countdown.minutes : 0} label="Minutes" />
                <div className="text-2xl sm:text-3xl text-[#1A1A1A]/40 font-light -mt-5">:</div>
                <CountdownUnit value={mounted ? countdown.seconds : 0} label="Seconds" />
              </div>
            ) : (
              <div className="text-center lg:text-left">
                <p className="text-lg text-[#C9A96E] font-serif italic">Available Now</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div
            className={cn(
              'mt-12 invisible-before-reveal',
              isIntersecting && 'reveal-slide-up'
            )}
            style={{ animationDelay: '650ms' }}
          >
            <Link
              href={meta.cta_link || '/products'}
              className="group inline-flex items-center gap-3 px-10 py-4 bg-[#1A1A1A] text-white text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#333] transition-all duration-300"
            >
              <span>{meta.cta_text || 'Reserve Yours'}</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/10 to-transparent" />
    </section>
  )
})

export default LimitedDrop
