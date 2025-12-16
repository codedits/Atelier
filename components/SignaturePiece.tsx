import { motion } from 'framer-motion'
import Image from 'next/image'

export default function SignaturePiece() {
  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative will-change-transform"
          >
              <div className="aspect-[4/5] overflow-hidden bg-white relative">
              <Image
                src="https://images.unsplash.com/photo-1705872907488-1a7a35fdc2c3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Signature Diamond Necklace"
                fill
                className="object-cover"
                sizes="(min-width:1024px) 50vw, 100vw"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-6 will-change-transform"
          >
            <div>
              <p className="text-sm uppercase tracking-wider text-[#D4A5A5] mb-3">Signature Collection</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#1A1A1A] leading-tight mb-4">
                Diamond Elegance Necklace
              </h2>
            </div>
            
            <p className="text-base text-[#6B6B6B] leading-relaxed">
              Handcrafted with 18k gold and precision-cut diamonds. This masterpiece embodies timeless elegance and exceptional artistry.
            </p>

            <div className="space-y-3 pt-4">
              <div className="flex justify-between py-2 border-b border-[#E5E5E5]">
                <p className="text-sm text-[#6B6B6B]">Material</p>
                <p className="text-sm text-[#1A1A1A] font-medium">18K Gold</p>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5E5E5]">
                <p className="text-sm text-[#6B6B6B]">Stones</p>
                <p className="text-sm text-[#1A1A1A] font-medium">42 Diamonds (12.5ct)</p>
              </div>
              <div className="flex justify-between py-2">
                <p className="text-sm text-[#6B6B6B]">Price</p>
                <p className="text-xl text-[#1A1A1A] font-medium">₨1,650,000</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <a href="#contact" className="btn btn-primary px-8 py-3 text-sm">View Details</a>
              <a href="#consultation" className="btn btn-outline px-8 py-3 text-sm">Book Viewing</a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
