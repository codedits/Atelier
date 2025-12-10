import { motion } from 'framer-motion'
import Image from 'next/image'

type Props = {
  name: string
  price: string
  img: string
  category?: string
}

export default function ProductCard({ name, price, img, category = 'Fine Jewellery' }: Props) {
  return (
    <motion.article 
      className="group cursor-pointer will-change-transform" 
      whileHover={{ y: -4 }} 
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-[#F8F7F5] group-hover:shadow-lg transition-shadow duration-300">
        <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
          <Image src={img} alt={name} fill className="object-cover" sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" />
        </div>

        {/* Quick view button on hover */}
        <div className="absolute inset-x-0 bottom-0 bg-white/95 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button className="w-full text-sm font-medium text-[#1A1A1A] hover:text-[#D4A5A5] transition-colors">
            Quick View
          </button>
        </div>
      </div>
      
      <div className="space-y-1 text-center px-2">
        <h3 className="font-normal text-base text-[#1A1A1A] group-hover:text-[#D4A5A5] transition-colors">{name}</h3>
        <p className="text-sm text-[#6B6B6B]">{price}</p>
      </div>
    </motion.article>
  )
}
