import { memo } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface Highlight {
  id: string
  title: string
  subtitle: string
  image: string
  link: string
  badge?: string
  color?: string
}

interface CollectionsHighlightProps {
  highlights?: Highlight[]
}

const defaultHighlights: Highlight[] = [
    {
    id: '1',
    title: 'Engagement Rings',
    subtitle: 'Timeless symbols of eternal love',
    image: 'https://images.unsplash.com/photo-1588814096146-e7c56156f9f8?q=80&w=1280&auto=format&fit=crop',
    link: '/products?category=rings',
    badge: 'New',
    color: '#7A4A2B'
  },
  {
    id: '2',
    title: 'Fine Necklaces',
    subtitle: 'Elegantly crafted for every moment',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=1280&auto=format&fit=crop',
    link: '/products?category=necklaces',
    badge: 'Bestseller',
    color: '#7A4A2B'
  },
  {
    id: '3',
    title: 'Statement Pieces',
    subtitle: 'Bold designs that make an impression',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1280&auto=format&fit=crop',
    link: '/products',
    badge: 'Limited',
    color: '#7A4A2B'
  }
]

const CollectionsHighlight = memo(function CollectionsHighlight({ highlights = defaultHighlights }: CollectionsHighlightProps) {
  return (
    <section style={{ color: '#FFFFFF' }} className="collections-highlight py-12 md:py-20 bg-[#1A1A1A] text-white w-full overflow-hidden">
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm uppercase tracking-widest text-white mb-3">Curated Collections</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-4">
            Discover What's Special
          </h2>
          <p className="text-white text-base max-w-xl mx-auto">
            Explore our carefully curated collections designed for those who appreciate exceptional craftsmanship.
          </p>
        </motion.div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group h-full"
            >
              <Link href={highlight.link} className="flex flex-col h-full group">
                {/* Image Container */}
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] mb-6 bg-[#F5F5F5]">
                  <Image
                    src={highlight.image}
                    alt={highlight.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  
                  {/* Badge */}
                  {highlight.badge && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 + 0.2 }}
                      className="absolute top-4 right-4 px-3 py-1.5 bg-[#7A4A2B] text-white text-xs font-semibold uppercase tracking-wider rounded-full"
                    >
                      {highlight.badge}
                    </motion.div>
                  )}

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-2xl font-semibold text-white mb-2 transition-colors duration-300">
                    {highlight.title}
                  </h3>
                  <p className="text-white text-sm leading-relaxed mb-4 flex-1">
                    {highlight.subtitle}
                  </p>
                  
                  {/* CTA Link */}
                  <div className="flex items-center gap-2 text-white/90 font-medium text-sm group-hover:gap-3 transition-all duration-300">
                    <span>Explore</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>

                {/* Bottom Accent Line */}
                
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3 border border-white text-white font-medium rounded-lg hover:bg-white hover:text-[#1A1A1A] transition-colors duration-300"
          >
            View All Collections
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
})

export default CollectionsHighlight
