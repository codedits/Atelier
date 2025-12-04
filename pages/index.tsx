import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  Header, 
  Hero, 
  Footer, 
  ProductCard,
  FeaturedCollections,
  SignaturePiece,
  Craftsmanship,
  Testimonials,
  Newsletter
} from '../components'

const newArrivals = [
  { 
    id: '1', 
    name: 'Étoile Diamond Necklace', 
    price: '$12,800', 
    category: 'Necklaces',
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: '2', 
    name: 'Luna Pearl Bracelet', 
    price: '$4,200', 
    category: 'Bracelets',
    img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: '3', 
    name: 'Solitaire Ring', 
    price: '$18,500', 
    category: 'Rings',
    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: '4', 
    name: 'Sapphire Drop Earrings', 
    price: '$8,900', 
    category: 'Earrings',
    img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: '5', 
    name: 'Diamond Tennis Bracelet', 
    price: '$15,200', 
    category: 'Bracelets',
    img: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: '6', 
    name: 'Emerald Cocktail Ring', 
    price: '$22,500', 
    category: 'Rings',
    img: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop' 
  },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>Atelier — Fine Jewellery</title>
        <meta name="description" content="Atelier — Exquisite handcrafted fine jewellery" />
      </Head>
      
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        <main>
          {/* 1. Hero Section - Ultra Premium */}
          <Hero />

          {/* 2. Featured Collections - 4 Card Layout */}
          <FeaturedCollections />

          {/* 3. Signature Piece Highlight */}
          <SignaturePiece />

          {/* 4. Craftsmanship / Brand Story */}
          <Craftsmanship />

          {/* 5. New Arrivals / Best Sellers - Grid */}
          <motion.section 
            id="new-arrivals" 
            className="py-24 md:py-32 bg-black"
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div 
                className="text-center mb-20" 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.6 }}
              >
                <div className="inline-block px-4 py-2 border border-[#D4AF37]/30 text-xs tracking-[0.25em] uppercase text-[#D4AF37] mb-6">
                  Latest Collection
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-white">New Arrivals</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                  Discover our newest creations, each piece a testament to timeless elegance.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newArrivals.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ProductCard 
                      name={product.name} 
                      price={product.price} 
                      img={product.img}
                      category={product.category}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* 6. Testimonials - High-End Style */}
          <Testimonials />

          {/* 7. Newsletter - Inner Circle */}
          <Newsletter />

        </main>
        
        {/* 8. Footer - Minimal Luxury */}
        <Footer />
      </div>
    </>
  )
}
