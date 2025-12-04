import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Premium hero image - elegant couple wearing jewelry */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop" 
          alt="Elegant luxury jewelry"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
      </div>
      
      {/* Text overlay - ultra premium centered */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-4xl mx-auto text-center">
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1, ease: "easeOut" }} 
              className="mb-6 leading-tight"
            >
              <span className="block text-5xl md:text-7xl lg:text-8xl text-white font-light tracking-tight">
                Timeless Elegance,
              </span>
              <span className="block text-5xl md:text-7xl lg:text-8xl text-white font-light tracking-tight">
                Crafted for You.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }} 
              className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Fine jewelry for men & women—crafted with precision and passion.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }} 
              className="flex flex-col sm:flex-row justify-center gap-6"
            >
              <a href="#men" className="btn btn-primary px-10 py-4 text-sm">Shop Men</a>
              <a href="#women" className="btn btn-outline px-10 py-4 text-sm">Shop Women</a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
