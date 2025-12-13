import Head from 'next/head'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { 
  Header, 
  Hero, 
  ProductCard,
  FeaturedCollections,
} from '../components'

// Lazy load below-fold components for faster initial render
const SignaturePiece = dynamic(() => import('../components/SignaturePiece'), { ssr: true })
const Craftsmanship = dynamic(() => import('../components/Craftsmanship'), { ssr: true })
const Testimonials = dynamic(() => import('../components/Testimonials'), { ssr: true })
const Newsletter = dynamic(() => import('../components/Newsletter'), { ssr: true })
const Footer = dynamic(() => import('../components/Footer'), { ssr: true })

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
    // Only fetch 3 newest products for the New Arrivals section
    fetch('/api/products?limit=3')
      .then(res => res.json())
      .then(data => {
        const visible = data.filter((p: Product & { is_hidden?: boolean }) => !p.is_hidden).slice(0, 3)
        setNewArrivals(visible)
      })
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setLoading(false))
  }, [])
  return (
    <>
      <Head>
        <title>Atelier — Luxury Fine Jewellery | Handcrafted Rings, Necklaces & More</title>
        <meta name="description" content="Discover exquisite handcrafted fine jewellery at Atelier. Shop luxury rings, necklaces, bracelets, and earrings crafted by master artisans with premium 18k gold and diamonds." />
        <meta name="keywords" content="fine jewellery, luxury jewelry, handcrafted rings, gold necklaces, diamond earrings, bracelets, artisan jewelry, 18k gold, premium accessories" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Atelier — Luxury Fine Jewellery | Timeless Elegance" />
        <meta property="og:description" content="Fine jewellery handcrafted by master artisans. Shop rings, necklaces, bracelets and more with worldwide shipping." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://codedits.github.io/Atelier" />
        
        {/* Twitter */}
        <meta name="twitter:title" content="Atelier — Luxury Fine Jewellery" />
        <meta name="twitter:description" content="Exquisite handcrafted fine jewellery. Shop luxury rings, necklaces, bracelets & earrings." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop" />
        
        <link rel="canonical" href="https://codedits.github.io/Atelier" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://codedits.github.io/Atelier/#website",
              "url": "https://codedits.github.io/Atelier",
              "name": "Atelier Fine Jewellery",
              "description": "Exquisite handcrafted fine jewellery",
              "publisher": { "@id": "https://codedits.github.io/Atelier/#organization" },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://codedits.github.io/Atelier/products?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "Organization",
              "@id": "https://codedits.github.io/Atelier/#organization",
              "name": "Atelier Fine Jewellery",
              "url": "https://codedits.github.io/Atelier",
              "logo": {
                "@type": "ImageObject",
                "url": "https://codedits.github.io/Atelier/atelier%20s.svg",
                "width": 512,
                "height": 512
              },
              "description": "Luxury fine jewellery handcrafted by master artisans",
              "sameAs": [
                "https://instagram.com/atelier",
                "https://facebook.com/atelier",
                "https://pinterest.com/atelier"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": "English"
              }
            },
            {
              "@type": "WebPage",
              "@id": "https://codedits.github.io/Atelier/#webpage",
              "url": "https://codedits.github.io/Atelier",
              "name": "Atelier — Luxury Fine Jewellery",
              "isPartOf": { "@id": "https://codedits.github.io/Atelier/#website" },
              "about": { "@id": "https://codedits.github.io/Atelier/#organization" },
              "description": "Shop luxury handcrafted fine jewellery including rings, necklaces, bracelets, and earrings"
            },
            {
              "@type": "ItemList",
              "name": "Featured Products",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "@type": "Product",
                    "name": "Rings",
                    "url": "https://codedits.github.io/Atelier/products?category=rings"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "@type": "Product",
                    "name": "Necklaces",
                    "url": "https://codedits.github.io/Atelier/products?category=necklaces"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "item": {
                    "@type": "Product",
                    "name": "Bracelets",
                    "url": "https://codedits.github.io/Atelier/products?category=bracelets"
                  }
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "item": {
                    "@type": "Product",
                    "name": "Earrings",
                    "url": "https://codedits.github.io/Atelier/products?category=earrings"
                  }
                }
              ]
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
