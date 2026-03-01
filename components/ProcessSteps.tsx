import { memo } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface StepData {
  number: string
  title: string
  description: string
}

interface ProcessStepsData {
  title?: string
  subtitle?: string
  metadata?: {
    steps?: StepData[]
  }
}

interface ProcessStepsProps {
  data?: ProcessStepsData
}

// Default icons keyed by index
const defaultIcons = [
  (
    <svg key="i0" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  (
    <svg key="i1" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  (
    <svg key="i2" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  (
    <svg key="i3" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )
]

const defaultSteps: StepData[] = [
  { number: '01', title: 'Design', description: 'Each piece begins with a vision, sketched by our designers who blend classic elegance with modern aesthetics.' },
  { number: '02', title: 'Select', description: 'Our gemologists hand-select only the finest diamonds and gemstones, each chosen for its exceptional quality.' },
  { number: '03', title: 'Craft', description: 'Master artisans bring each design to life using time-honored techniques passed down through generations.' },
  { number: '04', title: 'Perfect', description: 'Every piece undergoes rigorous quality inspection before being presented in our signature luxury packaging.' },
]

const defaultData: ProcessStepsData = {
  title: 'From Vision to Reality',
  subtitle: 'Our Process',
  metadata: { steps: defaultSteps }
}

const ProcessSteps = memo(function ProcessSteps({ data: propData }: ProcessStepsProps) {
  const d = { ...defaultData, ...propData, metadata: { ...defaultData.metadata, ...propData?.metadata } }
  const steps = d.metadata?.steps || defaultSteps
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })

  return (
    <section className="luxury-section w-full overflow-hidden bg-[#FAF9F6]/50" ref={sectionRef}>
      <div className="w-full mx-auto px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div
          className={cn(
            "text-center mb-16 md:mb-24 invisible-before-reveal",
            isIntersecting && "reveal-slide-up"
          )}
        >
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#1A1A1A] mb-4 font-medium opacity-70">
            {d.subtitle}
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1A1A1A] mb-8 italic">
            {d.title}
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-[#1A1A1A]/20" />
            <div className="w-1.5 h-1.5 rotate-45 border border-[#1A1A1A]/40" />
            <div className="h-[1px] w-12 bg-[#1A1A1A]/20" />
          </div>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Mobile Snap Slider / Desktop Grid */}
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-6 px-6 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden lg:block absolute top-[2rem] left-[15%] right-[15%] h-px bg-[#1A1A1A]/10" />

            {steps.map((step, index) => (
              <div
                key={step.number}
                className={cn(
                  "relative text-center px-10 md:px-6 min-w-[300px] md:min-w-0 snap-center flex-shrink-0 invisible-before-reveal group",
                  isIntersecting && "reveal-slide-up"
                )}
                style={{ animationDelay: isIntersecting ? `${index * 150 + 150}ms` : '0ms' }}
              >
                {/* Step number indicator */}
                <div className="relative z-10 w-16 h-16 mx-auto mb-10 flex items-center justify-center">
                  <div className="absolute inset-0 border border-[#1A1A1A]/20 rotate-45 transition-all duration-700 group-hover:rotate-[135deg] group-hover:border-[#1A1A1A]/50 bg-white shadow-sm" />
                  <span className="relative z-20 text-[#1A1A1A] text-lg font-light tracking-wider font-serif">
                    {step.number}
                  </span>
                </div>

                {/* Icon Container */}
                <div className="text-[#1A1A1A]/60 flex justify-center mb-6 transition-transform duration-500 group-hover:scale-110">
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-[#1A1A1A]/5 flex items-center justify-center">
                    {defaultIcons[index % defaultIcons.length]}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-medium text-[#1A1A1A] mb-4 tracking-wider uppercase text-[13px]">
                  {step.title}
                </h3>
                <p className="text-[14px] text-[#555] leading-relaxed max-w-[260px] mx-auto opacity-90 font-light italic">
                  &ldquo;{step.description}&rdquo;
                </p>
              </div>
            ))}
          </div>
          
          {/* Mobile Scroll Indicator */}
          <div className="flex justify-center gap-2 mt-8 md:hidden">
            {steps.map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-[#1A1A1A]/20" />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
})

export default ProcessSteps
