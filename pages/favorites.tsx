import Head from 'next/head'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header, Footer, ProductCard } from '@/components'
import { useFavorites } from '@/context/FavoritesContext'

export default function FavoritesPage() {
  const { favorites, loading } = useFavorites()

  return (
    <>
      <Head>
        <title>My Favorites — Atelier</title>
        <meta name="description" content="Your favorite jewelry pieces from Atelier" />
      </Head>

      <div className="min-h-screen bg-white">
        <Header />

        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-medium text-[#111827] mb-4">
                My Favorites
              </h1>
              <p className="text-base text-[#6B7280] max-w-2xl mx-auto">
                Your curated collection of pieces you love
              </p>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-8 w-8 border-2 border-[#1A1A1A] border-t-transparent rounded-full" />
              </div>
            ) : favorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h2 className="text-xl font-medium text-[#111827] mb-4">No favorites yet</h2>
                <p className="text-[#6B7280] mb-8">
                  Start adding pieces you love by clicking the heart icon on any product.
                </p>
                <Link
                  href="/products"
                  className="inline-block px-8 py-3 bg-[#1A1A1A] text-white font-medium rounded hover:bg-[#333] transition-colors"
                >
                  Browse Products
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {favorites.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
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
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
