import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import Image from 'next/image'

interface CraftsmanshipStat {
  value: string
  label: string
}

interface CraftsmanshipData {
  title?: string
  subtitle?: string
  content?: string
  image_url?: string
  metadata?: {
    stats?: CraftsmanshipStat[]
  }
}

interface CraftsmanshipProps {
  data?: CraftsmanshipData
}

const defaultData: CraftsmanshipData = {
  title: 'Handcrafted Excellence',
  subtitle: 'Our Heritage',
  content: 'Every piece is meticulously crafted by our master artisans, blending traditional techniques with contemporary design.\n\nFrom the initial sketch to the final polish, we ensure each creation meets our exacting standards of quality and beauty.',
  image_url: '/pexels-peter-ohis-322737401-13726059.jpg',
  metadata: {
    stats: [
      { value: '35+', label: 'Years of Artistry' },
      { value: '12', label: 'Master Artisans' },
      { value: '5000+', label: 'Unique Pieces' }
    ]
  }
}

export default function Craftsmanship({ data: propData }: CraftsmanshipProps) {
  if (!propData || (propData as any).is_active === false) return null
  const d = { ...defaultData, ...propData, metadata: { ...defaultData.metadata, ...propData?.metadata } }
  const stats = d.metadata?.stats || defaultData.metadata!.stats!
  const paragraphs = (d.content || '').split('\n').filter(Boolean)
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
                {d.subtitle}
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#1A1A1A] leading-[1.1] tracking-wide font-serif">
                {d.title}
              </h2>
            </div>

            {/* Gold divider */}
            <div className="w-16 h-px bg-gradient-to-r from-[#1A1A1A] to-transparent" />

            <div className="space-y-5 text-base text-[#4A4A4A] leading-relaxed">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-[#E8E4DF]">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl md:text-5xl text-[#1A1A1A] font-light mb-2 font-display">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-[#4A4A4A] uppercase tracking-[0.2em]">
                    {stat.label}
                  </div>
                </div>
              ))}
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
                src={d.image_url || defaultData.image_url!}
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
