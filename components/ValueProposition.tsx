import { memo, useMemo } from 'react'
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

  const values = useMemo(() => {
    return config?.features?.value_proposition || defaultValues
  }, [config?.features?.value_proposition])

  // Create a scrolling marquee version for visual interest
  const doubled = [...values, ...values]

  return (
    <section className="py-4 md:py-5 bg-[#FAF9F6] border-t border-b border-[#E8E4DF] w-full overflow-hidden">
      {/* Mobile: static grid | Desktop: animated ticker */}
      {/* Mobile grid */}
      <div className="md:hidden w-full mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 gap-4">
          {values.map((value: { icon: string; title: string; description: string }) => (
            <div key={value.title} className="flex flex-col items-center text-center py-3">
              <div className="text-[#1A1A1A] mb-2">
                {getIcon(value.icon)}
              </div>
              <h3 className="text-[10px] font-medium text-[#1A1A1A] uppercase tracking-[0.15em] mb-0.5">
                {value.title}
              </h3>
              <p className="text-[9px] text-[#4A4A4A] tracking-wider">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: smooth scrolling ticker */}
      <div className="hidden md:block w-full overflow-hidden">
        <div className="value-ticker" style={{ animationDuration: '30s' }}>
          {doubled.map((value: { icon: string; title: string; description: string }, i: number) => (
            <div key={`${value.title}-${i}`} className="flex items-center gap-3 px-10 flex-shrink-0">
              <div className="text-[#1A1A1A]/70">
                {getIcon(value.icon)}
              </div>
              <div>
                <span className="text-[11px] font-medium text-[#1A1A1A] uppercase tracking-[0.15em]">
                  {value.title}
                </span>
                <span className="text-[10px] text-[#4A4A4A] tracking-wider ml-2">
                  — {value.description}
                </span>
              </div>
              <span className="text-[#E8E4DF] ml-6">✦</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

export default ValueProposition
