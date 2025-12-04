import { motion } from 'framer-motion'

type Props = {
  name: string
  price: string
  img: string
  category?: string
}

export default function ProductCard({ name, price, img, category = 'Fine Jewellery' }: Props) {
  return (
    <motion.article className="group cursor-pointer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-zinc-900">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${img})` }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button className="px-6 py-3 text-xs font-medium tracking-widest uppercase border border-white text-white hover:bg-white hover:text-black transition-all">
            View
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-xs tracking-widest uppercase text-gold">{category}</p>
        <h3 className="font-display text-lg text-white">{name}</h3>
        <p className="text-sm text-gray-400">{price}</p>
      </div>
    </motion.article>
  )
}
