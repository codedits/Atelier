import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  id?: string
  name: string
  price: string | number
  img: string
  category?: string
  oldPrice?: number
}

export default function ProductCard({ id, name, price, img, category = 'Fine Jewellery', oldPrice }: Props) {
  const formattedPrice = typeof price === 'number' ? `₨${price.toLocaleString()}` : price
  const productUrl = id ? `/products/${id}` : '/products'

  return (
    <motion.article 
      className="group cursor-pointer will-change-transform" 
      whileHover={{ y: -4 }} 
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Link href={productUrl} className="block">
        <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-[#F8F7F5] group-hover:shadow-lg transition-shadow duration-300">
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
            <Image src={img} alt={name} fill className="object-cover" sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" />
          </div>

          {/* Sale badge */}
          {oldPrice && (
            <div className="absolute top-3 left-3 bg-[#D4A5A5] text-white text-xs font-medium px-2 py-1 rounded">
              Sale
            </div>
          )}

          {/* Quick view button on hover */}
          <div className="absolute inset-x-0 bottom-0 bg-white/95 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
            <span className="block w-full text-sm font-medium text-[#1A1A1A] text-center">
              View Details
            </span>
          </div>
        </div>
        
        <div className="space-y-1 text-center px-2">
          <p className="text-xs text-[#6B6B6B] uppercase tracking-wide">{category}</p>
          <h3 className="font-normal text-base text-[#1A1A1A] group-hover:text-[#D4A5A5] transition-colors">{name}</h3>
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-[#1A1A1A] font-medium">{formattedPrice}</p>
            {oldPrice && (
              <p className="text-sm text-[#9CA3AF] line-through">₨{oldPrice.toLocaleString()}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
