import { memo } from 'react'
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

  return (
    <section className="luxury-section bg-[#FAF9F6] w-full overflow-hidden" ref={sectionRef} aria-label="Customer testimonials">
      <div className="w-full mx-auto px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <div
          className={cn(
            "text-center mb-16 md:mb-20 will-change-transform invisible-before-reveal",
            isIntersecting && "reveal-slide-up"
          )}
        >
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#1A1A1A] mb-4">
            Testimonials
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#1A1A1A] mb-6">
            What Our Clients Say
          </h2>
          <div className="luxury-divider mt-6">
            <div className="luxury-divider-diamond" />
          </div>
        </div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={cn(
                "text-center px-4 md:px-6 will-change-transform invisible-before-reveal relative",
                isIntersecting && "reveal-slide-up"
              )}
              style={{ animationDelay: isIntersecting ? `${index * 150 + 100}ms` : '0ms' }}
            >
              {/* Large decorative quote */}
              <div className="text-6xl md:text-7xl text-[#1A1A1A]/10 leading-none mb-4 select-none font-serif">
                &ldquo;
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1.5 mb-6" role="img" aria-label={`${testimonial.rating || 5} out of 5 stars`}>
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-[#1A1A1A]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote text */}
              <p className="text-[#1A1A1A]/70 text-lg leading-relaxed mb-8 italic font-serif">
                {testimonial.content}
              </p>

              {/* Gold separator */}
              <div className="w-8 h-px bg-[#1A1A1A]/30 mx-auto mb-4" />

              {/* Name */}
              <div className="text-[11px] text-[#1A1A1A] uppercase tracking-[0.2em]">
                {testimonial.customer_name}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
})
