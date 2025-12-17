import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Craftsmanship() {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Content First */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 order-2 lg:order-1 will-change-transform"
          >
            <div>
              <p className="text-sm uppercase tracking-wider text-[#D4A5A5] mb-3">Our Heritage</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#1A1A1A] leading-tight">
                Handcrafted Excellence
              </h2>
            </div>
            
            <div className="space-y-4 text-base text-[#6B6B6B] leading-relaxed">
              <p>
                Every piece is meticulously crafted by our master artisans, blending traditional techniques with contemporary design.
              </p>
              <p>
                From the initial sketch to the final polish, we ensure each creation meets our exacting standards of quality and beauty.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div className="text-center">
                <div className="text-3xl md:text-4xl text-[#1A1A1A] font-medium mb-1">35+</div>
                <div className="text-xs text-[#6B6B6B] uppercase tracking-wider">Years</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl text-[#1A1A1A] font-medium mb-1">12</div>
                <div className="text-xs text-[#6B6B6B] uppercase tracking-wider">Artisans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl text-[#1A1A1A] font-medium mb-1">5000+</div>
                <div className="text-xs text-[#6B6B6B] uppercase tracking-wider">Pieces</div>
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative order-1 lg:order-2 will-change-transform"
          >
            <div className="aspect-[4/5] overflow-hidden bg-[#f0e3ce] relative">
              <Image
                src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=1200&auto=format&fit=crop"
                alt="Master artisan crafting jewelry"
                fill
                className="object-cover"
                sizes="(min-width:1024px)50vw,100vw"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
