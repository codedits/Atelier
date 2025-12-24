import { memo } from 'react'
import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Design',
    description: 'Each piece begins with a vision, sketched by our designers who blend classic elegance with modern aesthetics.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    )
  },
  {
    number: '02',
    title: 'Select',
    description: 'Our gemologists hand-select only the finest diamonds and gemstones, each chosen for its exceptional quality.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    number: '03',
    title: 'Craft',
    description: 'Master artisans bring each design to life using time-honored techniques passed down through generations.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )
  },
  {
    number: '04',
    title: 'Perfect',
    description: 'Every piece undergoes rigorous quality inspection before being presented in our signature luxury packaging.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  }
]

const ProcessSteps = memo(function ProcessSteps() {
  return (
    <section className="py-12 md:py-20 w-full overflow-hidden" style={{ backgroundColor: 'var(--color-offwhite)' }}>
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-[#B91C1C] mb-3">Our Process</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#1A1A1A] mb-4">
            From Vision to Reality
          </h2>
          <p className="text-[#6B6B6B] text-base max-w-xl mx-auto">
            Discover the meticulous journey each piece takes from initial concept to your jewelry box.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative group"
            >
              {/* Connector Line (hidden on mobile & last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-[2px] bg-gradient-to-r from-[#B91C1C]/50 to-transparent" />
              )}
              
              <div className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -left-2 text-6xl font-bold text-[#B91C1C]/10 select-none">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white mb-6 group-hover:bg-[#B91C1C] transition-colors duration-300">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-[#6B6B6B] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
})

export default ProcessSteps
