import Head from 'next/head'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
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

interface Product {
  id: string
  name: string
  price: number
  old_price?: number
  category: string
  image_url: string
}

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?limit=6')
      .then(res => res.json())
      .then(data => {
        // Filter visible products and take first 6
        const visible = data.filter((p: Product & { is_hidden?: boolean }) => !p.is_hidden).slice(0, 6)
        setNewArrivals(visible)
      })
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setLoading(false))
  }, [])
  return (
    <>
      <Head>
        <title>Atelier — Fine Jewellery</title>
        <meta name="description" content="Atelier — Exquisite handcrafted fine jewellery" />
        <meta property="og:title" content="Atelier — Timeless Elegance" />
        <meta property="og:description" content="Fine jewellery handcrafted by master artisans. Shop rings, necklaces, bracelets and more." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1600&auto=format&fit=crop" />
        <link rel="canonical" href="https://codedits.github.io/Atelier" />

        {/* JSON-LD Organization + Product (signature piece) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "name": "Atelier",
              "url": "https://codedits.github.io/Atelier",
              "logo": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
              "sameAs": ["https://instagram.com"]
            },
            {
              "@type": "Product",
              "name": "The Imperial Diamond Necklace",
              "description": "Handcrafted with 18k gold and precision-cut stones.",
              "image": ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop"],
              "offers": { "@type": "Offer", "priceCurrency": "USD", "price": "125000", "availability": "https://schema.org/InStock" }
            }
          ]
        }) }} />
      </Head>
      
      <div className="min-h-screen bg-white">
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
          <section 
            id="new-arrivals" 
            className="py-12 md:py-20 bg-white will-change-transform"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div 
                className="text-center mb-8 md:mb-12" 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4 text-[#1A1A1A]">New Arrivals</h2>
                <p className="text-[#6B6B6B] max-w-xl mx-auto text-base">
                  Discover our newest creations
                </p>
              </motion.div>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-2 border-[#1A1A1A] border-t-transparent rounded-full" />
                </div>
              ) : newArrivals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {newArrivals.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.18 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="will-change-transform"
                    >
                      <ProductCard 
                        id={product.id}
                        name={product.name} 
                        price={product.price}
                        oldPrice={product.old_price}
                        img={product.image_url}
                        category={product.category}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#6B6B6B]">No products available yet.</p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center mt-12"
              >
                <a 
                  href="/products" 
                  className="inline-block px-8 py-3 border border-[#1A1A1A] text-[#1A1A1A] font-medium hover:bg-[#1A1A1A] hover:text-white transition-colors"
                >
                  View All Products
                </a>
              </motion.div>
            </div>
          </section>

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
