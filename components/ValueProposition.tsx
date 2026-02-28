import { memo, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { useSiteConfig } from '@/context/SiteConfigContext'

const getIcon = (name: string) => {
  switch (name) {
    case 'truck':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    case 'shield':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'gift':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    case 'leaf':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    default:
      return null
  }
}

const defaultValues = [
  {
    icon: 'truck',
    title: 'Complimentary Shipping',
    description: 'On orders above ₨15,000'
  },
  {
    icon: 'shield',
    title: 'Lifetime Guarantee',
    description: 'Every piece, forever'
  },
  {
    icon: 'gift',
    title: 'Luxury Presentation',
    description: 'Gift-ready packaging'
  },
  {
    icon: 'leaf',
    title: 'Ethically Sourced',
    description: 'Conflict-free materials'
  }
]

const ValueProposition = memo(function ValueProposition() {
  const { config } = useSiteConfig()
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })

  const values = useMemo(() => {
    return config?.features?.value_proposition || defaultValues
  }, [config?.features?.value_proposition])

  return (
    <section className="py-6 md:py-8 bg-[#FAF9F6] border-t border-b border-[#E8E4DF] w-full overflow-hidden" ref={sectionRef}>
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {values.map((value: { icon: string, title: string, description: string }, index: number) => (
            <div
              key={value.title}
              className={cn(
                "flex flex-col items-center text-center group py-4 invisible-before-reveal relative",
                isIntersecting && "reveal-fade-in"
              )}
              style={{ animationDelay: isIntersecting ? `${index * 80}ms` : '0ms' }}
            >
              {/* Gold separator between items (desktop) */}
              {index > 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gradient-to-b from-transparent via-[#1A1A1A]/20 to-transparent" />
              )}

              <div className="text-[#1A1A1A] mb-3 transition-all duration-500 group-hover:scale-110">
                {getIcon(value.icon)}
              </div>
              <h3 className="text-[11px] sm:text-xs font-medium text-[#1A1A1A] uppercase tracking-[0.2em] mb-1">
                {value.title}
              </h3>
              <p className="text-[10px] text-[#6B6B6B] leading-relaxed hidden sm:block tracking-wider">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

export default ValueProposition
