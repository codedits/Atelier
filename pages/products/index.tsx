import Head from 'next/head'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Header, Footer } from '../../components'

interface Product {
  id: string
  name: string
  description: string
  price: number
  old_price?: number
  category: string
  gender: string
  image_url: string
  stock: number
  is_hidden?: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [loading, setLoading] = useState(true)

  // Fetch products from API
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        // Filter out hidden products for public view
        const visibleProducts = data.filter((p: Product) => !p.is_hidden)
        setProducts(visibleProducts)
        setFilteredProducts(visibleProducts)
      })
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let filtered = [...products]

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Filter by gender
    if (selectedGender !== 'all') {
      filtered = filtered.filter(p => p.gender === selectedGender)
    }

    // Sort products
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, selectedGender, sortBy, products])

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]
  const genders = ['all', 'women', 'men']

  return (
    <>
      <Head>
        <title>Shop All Products — Atelier Fine Jewellery</title>
        <meta name="description" content="Browse our complete collection of handcrafted jewelry. Rings, necklaces, bracelets, and earrings." />
      </Head>

      <div className="min-h-screen bg-white">
        <Header />

        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#111827] mb-4">
                All Products
              </h1>
              <p className="text-base text-[#6B7280] max-w-2xl mx-auto">
                Discover our complete collection of handcrafted jewelry
              </p>
            </motion.div>

            {/* Filters & Sort */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-12 pb-6 border-b border-[#E5E7EB]"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                
                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#6B7280] mb-2 block">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-[#E5E7EB] rounded text-sm text-[#111827] focus:outline-none focus:border-[#D4A5A5] transition-colors"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Gender Filter */}
                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#6B7280] mb-2 block">For</label>
                    <select
                      value={selectedGender}
                      onChange={(e) => setSelectedGender(e.target.value)}
                      className="px-4 py-2 border border-[#E5E7EB] rounded text-sm text-[#111827] focus:outline-none focus:border-[#D4A5A5] transition-colors"
                    >
                      {genders.map(gender => (
                        <option key={gender} value={gender}>
                          {gender === 'all' ? 'Everyone' : gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#6B7280] mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-[#E5E7EB] rounded text-sm text-[#111827] focus:outline-none focus:border-[#D4A5A5] transition-colors"
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                  </select>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-4">
                <p className="text-sm text-[#6B7280]">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>
              </div>
            </motion.div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-[#D4A5A5] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#6B7280] mt-4">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Link href={`/products/${product.id}`} className="group block">
                      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-[#F8F7F5] group-hover:shadow-lg transition-shadow duration-300">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(min-width:1280px)25vw, (min-width:1024px)33vw, (min-width:640px)50vw, 100vw"
                        />
                        
                        {/* Sale badge */}
                        {product.old_price && (
                          <div className="absolute top-4 left-4 bg-[#D4A5A5] text-white text-xs font-medium px-3 py-1 rounded">
                            Sale
                          </div>
                        )}

                        {/* Quick view overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-white/95 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-center text-sm font-medium text-[#111827]">
                            View Details
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wider text-[#6B7280]">{product.category}</p>
                        <h3 className="font-normal text-base text-[#111827] group-hover:text-[#D4A5A5] transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-medium text-[#111827]">
                            ${product.price.toLocaleString()}
                          </p>
                          {product.old_price && (
                            <p className="text-sm text-[#6B7280] line-through">
                              ${product.old_price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-[#6B7280] text-lg">No products found matching your filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedGender('all')
                    setSortBy('default')
                  }}
                  className="mt-6 btn btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
