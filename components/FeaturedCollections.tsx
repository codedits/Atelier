import { motion } from 'framer-motion'

const collections = [
  {
    id: 1,
    title: "Men's Rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop",
    link: "#mens-rings"
  },
  {
    id: 2,
    title: "Women's Necklaces",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    link: "#womens-necklaces"
  },
  {
    id: 3,
    title: "Bracelets",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
    link: "#bracelets"
  },
  {
    id: 4,
    title: "Luxury Watches",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop",
    link: "#watches"
  }
]

export default function FeaturedCollections() {
  return (
    <section className="py-24 md:py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4">
            Featured Collections
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover our curated selection of timeless pieces
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {collections.map((collection, index) => (
            <motion.a
              key={collection.id}
              href={collection.link}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative overflow-hidden bg-black border border-[#D4AF37]/20 hover:border-[#D4AF37] transition-all duration-500"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <h3 className="text-xl md:text-2xl font-light text-white mb-3">
                  {collection.title}
                </h3>
                <span className="inline-flex items-center gap-2 text-[#D4AF37] text-sm tracking-wider uppercase group-hover:gap-4 transition-all duration-300">
                  Explore Collection 
                  <span className="text-lg">→</span>
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
