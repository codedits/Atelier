import { motion } from 'framer-motion'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Collection {
  id: string
  title: string
  description?: string
  image_url: string
  link: string
  display_order: number
}

const defaultCollections: Collection[] = [
  {
    id: '1',
    title: "Rings",
    image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop",
    link: "/products?category=rings",
    display_order: 0
  },
  {
    id: '2',
    title: "Necklaces",
    image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop",
    link: "/products?category=necklaces",
    display_order: 1
  },
  {
    id: '3',
    title: "Bracelets",
    image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop",
    link: "/products?category=bracelets",
    display_order: 2
  },
  {
    id: '4',
    title: "Earrings",
    image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop",
    link: "/products?category=earrings",
    display_order: 3
  }
]

export default function FeaturedCollections() {
  const [collections, setCollections] = useState<Collection[]>(defaultCollections)

  useEffect(() => {
    fetch('/api/admin/featured-collections')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setCollections(data)
        }
      })
      .catch(err => console.error('Failed to load collections:', err))
  }, [])

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#1A1A1A] mb-4">
            Shop by Category
          </h2>
          <p className="text-[#6B6B6B] text-base max-w-xl mx-auto">
            Discover our curated collections
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="will-change-transform"
            >
              <Link
                href={collection.link}
                className="group relative overflow-hidden rounded-2xl block h-80 md:h-96 cursor-pointer"
              >
                {/* Background Image */}
                <Image
                  src={collection.image_url}
                  alt={collection.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                />

                {/* Gradient Overlay - Dark to Transparent */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-100 group-hover:opacity-80 transition-opacity duration-500"></div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-6 md:p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="text-center w-full"
                  >
                    <h3 className="text-2xl md:text-3xl font-semibold text-white mb-3 group-hover:text-[#D4A5A5] transition-colors duration-300">
                      {collection.title}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-white text-sm font-medium group-hover:gap-3 transition-all duration-300">
                      <span>Explore</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                </div>

                {/* Accent Border on Hover */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D4A5A5] via-[#E8C0C0] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
