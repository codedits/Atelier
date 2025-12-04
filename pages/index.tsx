import Head from 'next/head'
import { motion } from 'framer-motion'
import { Header, Hero, Footer, ProductCard } from '../components'

const featuredProducts = [
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
]

const features = [
  { title: 'Handcrafted', desc: 'Master artisans' },
  { title: 'Ethical', desc: 'Sustainable sourcing' },
  { title: 'Lifetime Care', desc: 'Generational warranty' },
  { title: 'Bespoke', desc: 'Custom designs' },
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
          <Hero />

          {/* Hero Grid - Vertical Ring Images */}
          <motion.section className="py-0" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
              {featuredProducts.map((p, i) => (
                <motion.div key={p.id} className="relative h-[80vh] overflow-hidden group cursor-pointer" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: i * 0.12 }}>
                  <img 
                    src={p.img} 
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                    <span className="text-xs tracking-[0.25em] uppercase text-gold mb-3">{p.category}</span>
                    <h3 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-4 leading-tight">
                      {p.name}
                    </h3>
                    <p className="text-xl text-gray-300 mb-6">{p.price}</p>
                    <button className="self-start px-6 py-3 text-xs font-medium tracking-widest uppercase border border-white text-white hover:bg-white hover:text-black transition-all">
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Featured Collection */}
          <motion.section id="collection" className="py-32" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <motion.div className="text-center mb-24" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <span className="text-xs tracking-[0.3em] uppercase text-gold mb-4 block">Curated Collection</span>
                <h2 className="text-5xl md:text-6xl font-light mb-6">Exceptional Pieces</h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                  Each creation tells a story of elegance and timeless artistry.
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {featuredProducts.map(p => (
                  <ProductCard 
                    key={p.id} 
                    name={p.name} 
                    price={p.price} 
                    img={p.img}
                    category={p.category}
                  />
                ))}
              </div>
            </div>
          </motion.section>

          {/* Features */}
          <motion.section className="py-20 border-y border-white/5" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
                {features.map((f, i) => (
                  <motion.div key={i} className="text-center" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                    <h3 className="text-sm font-semibold tracking-wider uppercase mb-3 text-white">{f.title}</h3>
                    <p className="text-sm text-gray-400">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section id="contact" className="py-32" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-4xl md:text-5xl font-light mb-6">Begin Your Journey</h2>
              <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
                Schedule a private consultation with our master artisans.
              </p>
              <motion.a href="#" className="btn btn-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>Book Consultation</motion.a>
            </div>
          </motion.section>
        </main>
        
        <Footer />
      </div>
    </>
  )
}
