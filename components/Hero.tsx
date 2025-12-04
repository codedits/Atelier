import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Large vertical ring image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop" 
          alt="Elegant diamond ring"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>
      
      {/* Text overlay (centered) */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 mb-6 border border-gold/30 bg-black/40 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              <span className="text-xs tracking-[0.2em] uppercase text-gold">Est. 1987</span>
            </div>
            
            <div className="mb-4">
              <div className="inline-block px-4 py-2 mb-6 border border-white/20 text-xs tracking-[0.2em] uppercase text-white">EST. 1987</div>
            </div>

            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-3 leading-none">
              <span className="block text-3xl md:text-4xl text-white">Fine</span>
              <span className="block text-5xl md:text-[96px] leading-none font-extrabold uppercase tracking-tight text-white">JEWELLERY</span>
            </motion.h1>

            <p className="text-base md:text-lg text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed opacity-90">
              Timeless pieces meticulously crafted by master artisans. Each creation tells a story of elegance and exceptional artistry.
            </p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }} className="flex justify-center gap-6">
              <a href="#collection" className="btn btn-primary px-8 py-3">Explore Collection</a>
              <a href="#contact" className="btn btn-outline px-8 py-3">Book Consultation</a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
