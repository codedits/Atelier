import { motion } from 'framer-motion'
import Image from 'next/image'

export default function BentoGrid() {
  const bentoItems = [
    {
      id: 1,
      title: 'Handcrafted Excellence',
      description: 'Each piece meticulously created by master artisans',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=870&auto=format&fit=crop',
      size: 'col-span-1 row-span-1', // Default medium
      span: 'lg:col-span-2 lg:row-span-2'
    },
    {
      id: 2,
      title: 'Premium Materials',
      description: '18K Gold & Certified Diamonds',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=870&auto=format&fit=crop',
      size: 'col-span-1 row-span-1',
      span: 'lg:col-span-1 lg:row-span-1'
    },
    {
      id: 3,
      title: 'Timeless Design',
      description: 'Collections that transcend trends',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=870&auto=format&fit=crop',
      size: 'col-span-1 row-span-1',
      span: 'lg:col-span-1 lg:row-span-1'
    },
    {
      id: 4,
      title: 'Expert Curation',
      description: 'Carefully selected pieces for you',
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=870&auto=format&fit=crop',
      size: 'col-span-1 row-span-1',
      span: 'lg:col-span-2 lg:row-span-1'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <section className="py-16 md:py-24 bg-[#1B211A]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest !text-white mix-blend-normal mb-3">Our Collections</p>
          <h2 className="text-3xl md:text-5xl font-medium !text-white mix-blend-normal leading-tight max-w-2xl mx-auto">
            Explore Our Curated Selection
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[280px] md:auto-rows-[320px]"
        >
          {bentoItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={`${item.span} group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer`}
            >
              {/* Background Image */}
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 text-white">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <h3 className="text-lg md:text-xl font-semibold leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-white/90 line-clamp-2">
                    {item.description}
                  </p>
                </motion.div>
              </div>

              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <a href="/products" className="inline-flex items-center gap-2 px-8 py-3 bg-[#1A1A1A] text-white rounded-lg font-medium hover:bg-[#333333] transition-colors duration-300">
            View All Collections
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
