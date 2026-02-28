import { memo, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

export interface Testimonial {
  id: string
  customer_name: string
  content: string
  rating: number
  display_order: number
}

interface TestimonialsProps {
  testimonials?: Testimonial[]
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    content: "Exceptional craftsmanship and timeless elegance. Every detail speaks of unparalleled artistry.",
    customer_name: "Sarah M.",
    rating: 5,
    display_order: 0
  },
  {
    id: '2',
    content: "Each piece tells a story of beauty and precision. A truly remarkable experience from start to finish.",
    customer_name: "James D.",
    rating: 5,
    display_order: 1
  },
  {
    id: '3',
    content: "Quality that exceeds every expectation. The attention to detail is simply extraordinary.",
    customer_name: "Emily R.",
    rating: 5,
    display_order: 2
  }
]

export default memo(function Testimonials({ testimonials: initialTestimonials }: TestimonialsProps) {
  const testimonials = initialTestimonials && initialTestimonials.length > 0
    ? initialTestimonials
    : defaultTestimonials

  const { ref: sectionRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })
  const [activeIndex, setActiveIndex] = useState(0)

  // Auto-rotate the featured quote
  useEffect(() => {
    if (testimonials.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const featured = testimonials[activeIndex]

  return (
    <section className="bg-[#1A1A1A] text-white w-full overflow-hidden" ref={sectionRef} aria-label="Customer testimonials">
      {/* Featured testimonial — large cinematic quote */}
      <div className="py-20 md:py-28 lg:py-36 px-6 lg:px-8 max-w-5xl mx-auto">
        <div
          className={cn(
            "text-center invisible-before-reveal",
            isIntersecting && "reveal-fade-in"
          )}
        >
          {/* Stars */}
          <div className="flex justify-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-[#C9A96E]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Large quote */}
          <div className="relative min-h-[120px] flex items-center justify-center">
            {testimonials.map((t, i) => (
              <p
                key={t.id}
                className={cn(
                  "absolute inset-0 flex items-center justify-center text-2xl md:text-3xl lg:text-4xl leading-relaxed font-serif italic text-white/90 transition-all duration-700",
                  i === activeIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                )}
              >
                &ldquo;{t.content}&rdquo;
              </p>
            ))}
          </div>

          {/* Author with crossfade */}
          <div className="mt-10 relative h-8">
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                className={cn(
                  "absolute inset-0 flex items-center justify-center gap-3 transition-all duration-500",
                  i === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
              >
                <div className="w-6 h-px bg-[#C9A96E]" />
                <span className="text-[11px] uppercase tracking-[0.25em] text-white/60">{t.customer_name}</span>
                <div className="w-6 h-px bg-[#C9A96E]" />
              </div>
            ))}
          </div>

          {/* Nav dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "transition-all duration-300 rounded-full",
                    i === activeIndex ? "w-6 h-1.5 bg-[#C9A96E]" : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                  )}
                  aria-label={`Show testimonial ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom ticker of all testimonials */}
      {testimonials.length > 2 && (
        <div className="border-t border-white/10 py-4 overflow-hidden">
          <div className="testimonial-ticker" style={{ animationDuration: `${testimonials.length * 8}s` }}>
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={`${t.id}-${i}`} className="flex items-center gap-4 px-8 flex-shrink-0">
                <div className="flex gap-0.5">
                  {[...Array(t.rating || 5)].map((_, s) => (
                    <svg key={s} className="w-2.5 h-2.5 text-[#C9A96E]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-white/50 italic whitespace-nowrap max-w-[300px] truncate">
                  &ldquo;{t.content}&rdquo;
                </p>
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                  — {t.customer_name}
                </span>
                <span className="text-[#C9A96E]/30 ml-4">✦</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
})
