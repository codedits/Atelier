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
                      name={product.name} 
                      price={product.price} 
                      img={product.img}
                      category={product.category}
                    />
                  </motion.div>
                ))}
              </div>
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
