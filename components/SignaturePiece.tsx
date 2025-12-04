import { motion } from 'framer-motion'

export default function SignaturePiece() {
  return (
    <section className="py-24 md:py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden border border-[#D4AF37]/30">
              <img
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop"
                alt="The Imperial Diamond Necklace"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-[#D4AF37]/50 pointer-events-none" />
            <div className="absolute -top-4 -left-4 w-24 h-24 border border-[#D4AF37]/50 pointer-events-none" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="inline-block px-4 py-2 border border-[#D4AF37]/30 text-xs tracking-[0.25em] uppercase text-[#D4AF37]">
              Signature Collection
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight">
              The Imperial Diamond Necklace
            </h2>
            
            <p className="text-lg text-gray-400 leading-relaxed">
              Handcrafted with 18k gold and precision-cut stones, this masterpiece embodies the pinnacle of fine jewelry artistry. Each diamond is carefully selected for its exceptional clarity and brilliance.
            </p>

            <div className="space-y-4 border-l-2 border-[#D4AF37]/30 pl-6">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Material</p>
                <p className="text-white">18K Yellow Gold</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Stones</p>
                <p className="text-white">42 Precision-Cut Diamonds (12.5ct)</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Price</p>
                <p className="text-2xl text-[#D4AF37]">$125,000</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#contact" className="btn btn-primary px-8 py-3">View Details</a>
              <a href="#consultation" className="btn btn-outline px-8 py-3">Book Private Viewing</a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
