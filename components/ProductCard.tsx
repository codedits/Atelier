import { motion } from 'framer-motion'

type Props = {
  name: string
  price: string
  img: string
  category?: string
}

export default function ProductCard({ name, price, img, category = 'Fine Jewellery' }: Props) {
  return (
    <motion.article 
      className="group cursor-pointer" 
      whileHover={{ y: -8 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-[#111] border border-white/5 group-hover:border-[#D4AF37]/50 transition-all duration-500">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${img})` }}
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-500" />
        
        {/* Gold icon on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-gray-500">{category}</p>
        <h3 className="font-light text-xl text-white group-hover:text-[#D4AF37] transition-colors duration-300">{name}</h3>
        <p className="text-sm text-gray-400">{price}</p>
      </div>
    </motion.article>
  )
}
