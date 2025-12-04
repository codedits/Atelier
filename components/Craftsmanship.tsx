import { motion } from 'framer-motion'

export default function Craftsmanship() {
  return (
    <section className="py-24 md:py-32 bg-[#111]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Content First */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8 order-2 lg:order-1"
          >
            <div className="inline-block px-4 py-2 border border-white/20 text-xs tracking-[0.25em] uppercase text-[#D4AF37]">
              Our Heritage
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight">
              Crafted by Master Artisans
            </h2>
            
            <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
              <p>
                Each piece blends tradition, precision, and timeless beauty. Our master craftsmen bring decades of expertise to every creation.
              </p>
              <p>
                From the initial sketch to the final polish, every step is executed with meticulous attention to detail, ensuring that each piece meets our exacting standards of excellence.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl md:text-4xl text-[#D4AF37] font-light mb-2">35+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Years</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl text-[#D4AF37] font-light mb-2">12</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Artisans</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl text-[#D4AF37] font-light mb-2">5000+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">Pieces</div>
              </div>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=1200&auto=format&fit=crop"
                alt="Master artisan crafting jewelry"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
