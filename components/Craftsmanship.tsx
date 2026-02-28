import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import Image from 'next/image'

export default function Craftsmanship() {
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver({ threshold: 0.2 })

  return (
    <section className="luxury-section bg-[#FAF9F6] w-full overflow-hidden" ref={sectionRef}>
      <div className="w-full mx-auto px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Content */}
          <div
            className={cn(
              "space-y-8 order-2 lg:order-1 will-change-transform invisible-before-reveal",
              isIntersecting && "reveal-slide-up"
            )}
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#1A1A1A] mb-4">
                Our Heritage
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#1A1A1A] leading-[1.1] tracking-wide font-serif">
                Handcrafted<br />Excellence
              </h2>
            </div>

            {/* Gold divider */}
            <div className="w-16 h-px bg-gradient-to-r from-[#1A1A1A] to-transparent" />

            <div className="space-y-5 text-base text-[#6B6B6B] leading-relaxed">
              <p>
                Every piece is meticulously crafted by our master artisans, blending traditional techniques with contemporary design.
              </p>
              <p>
                From the initial sketch to the final polish, we ensure each creation meets our exacting standards of quality and beauty.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-[#E8E4DF]">
              <div className="text-center">
                <div className="text-4xl md:text-5xl text-[#1A1A1A] font-light mb-2 font-serif">
                  35+
                </div>
                <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.2em]">
                  Years of Artistry
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl text-[#1A1A1A] font-light mb-2 font-serif">
                  12
                </div>
                <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.2em]">
                  Master Artisans
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl text-[#1A1A1A] font-light mb-2 font-serif">
                  5000+
                </div>
                <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.2em]">
                  Unique Pieces
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div
            className={cn(
              "relative order-1 lg:order-2 will-change-transform invisible-before-reveal",
              isIntersecting && "reveal-fade-in"
            )}
            style={{ animationDelay: isIntersecting ? '200ms' : '0ms' }}
          >
            <div className="aspect-[3/4] overflow-hidden relative">
              <Image
                src="/pexels-peter-ohis-322737401-13726059.jpg"
                alt="Master artisan crafting jewelry"
                fill
                className="object-cover"
                sizes="(min-width:1024px)50vw,100vw"
              />
              {/* Subtle gold frame overlay */}
              <div className="absolute inset-4 border border-[#1A1A1A]/20 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
