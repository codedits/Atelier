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
                className="group relative overflow-hidden bg-[#F8F7F5] hover:shadow-lg transition-shadow duration-300 block"
              >
                <div className="aspect-square overflow-hidden relative">
                  <Image
                    src={collection.image_url}
                    alt={collection.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 50vw"
                  />
                </div>
                
                <div className="p-4 text-center">
                  <h3 className="text-base md:text-lg font-medium text-[#1A1A1A] group-hover:text-[#D4A5A5] transition-colors">
                    {collection.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
