import Head from 'next/head'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { GetStaticProps } from 'next'
import { Header, Footer } from '../../components'
import { supabase } from '@/lib/supabase'

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

interface Category {
  id: string
  name: string
  created_at: string
}

interface ProductsPageProps {
  initialProducts: Product[]
  initialCategories: Category[]
}

// ISR: Regenerate every 60 seconds for fresh products
export const getStaticProps: GetStaticProps<ProductsPageProps> = async () => {
  let products: Product[] = []
  let categories: Category[] = []

  try {
    // Fetch products
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .or('is_hidden.is.null,is_hidden.eq.false')
      .order('created_at', { ascending: false })
    
    products = productsData || []

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    
    categories = categoriesData || []
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }

  return {
    props: {
      initialProducts: products,
      initialCategories: categories,
    },
    revalidate: 60, // ISR: Revalidate every 60 seconds
  }
}

export default function ProductsPage({ initialProducts, initialCategories }: ProductsPageProps) {
  const router = useRouter()
  const [products] = useState<Product[]>(initialProducts)
  const [categories] = useState<Category[]>(initialCategories)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')
  const [sortBy, setSortBy] = useState('default')

  // Read filters from URL query params on mount
  useEffect(() => {
    if (router.isReady) {
      const { category, gender } = router.query
      if (category && typeof category === 'string') {
        setSelectedCategory(category.toLowerCase())
      }
      if (gender && typeof gender === 'string') {
        setSelectedGender(gender.toLowerCase())
      }
    }
  }, [router.isReady, router.query])

  // Memoized filtered products for performance
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by category (case-insensitive)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase())
    }

    // Filter by gender (case-insensitive)
    if (selectedGender !== 'all') {
      filtered = filtered.filter(p => p.gender.toLowerCase() === selectedGender.toLowerCase())
    }

    // Sort products
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    return filtered
  }, [selectedCategory, selectedGender, sortBy, products])

  // Generate category options from API categories plus existing product categories
  const categoryOptions = useMemo(() => [
    'all',
    ...Array.from(new Set([
      ...categories.map(c => c.name),
      ...products.map(p => p.category)
    ]))
  ], [categories, products])
  
  const genders = ['all', 'women', 'men']

  return (
    <>
      <Head>
        <title>Shop All Jewelry — Rings, Necklaces, Bracelets & Earrings | Atelier</title>
        <meta name="description" content="Browse our complete collection of luxury handcrafted jewelry. Shop fine rings, elegant necklaces, stunning bracelets, and exquisite earrings with free shipping." />
        <meta name="keywords" content="jewelry shop, buy rings, gold necklaces, diamond bracelets, earrings online, luxury jewelry store" />
        <meta property="og:title" content="Shop All Jewelry | Atelier Fine Jewellery" />
        <meta property="og:description" content="Browse our complete collection of handcrafted jewelry. Rings, necklaces, bracelets, and earrings." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://codedits.github.io/Atelier/products" />
        <link rel="canonical" href="https://codedits.github.io/Atelier/products" />
        
        {/* JSON-LD CollectionPage */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Shop All Jewelry",
          "description": "Browse our complete collection of luxury handcrafted jewelry",
          "url": "https://codedits.github.io/Atelier/products",
          "isPartOf": {
            "@type": "WebSite",
            "name": "Atelier Fine Jewellery",
            "url": "https://codedits.github.io/Atelier"
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://codedits.github.io/Atelier" },
              { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://codedits.github.io/Atelier/products" }
            ]
          }
        }) }} />
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
                      {categoryOptions.map(cat => (
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
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-[#6B7280]">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>
                {(selectedCategory !== 'all' || selectedGender !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all')
                      setSelectedGender('all')
                    }}
                    className="text-sm text-[#D4A5A5] hover:text-[#c49595] transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear filters
                  </button>
                )}
              </div>
            </motion.div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
                  >
                    <Link href={`/products/${product.id}`} className="group block" prefetch={false}>
                      <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-[#F8F7F5] rounded-lg group-hover:shadow-xl transition-all duration-300">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(min-width:1280px)25vw, (min-width:1024px)33vw, (min-width:640px)50vw, 100vw"
                          loading={index < 8 ? 'eager' : 'lazy'}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAxEAPwCwAB//2Q=="
                        />
                        
                        {/* Sale badge */}
                        {product.old_price && (
                          <div className="absolute top-4 left-4 bg-[#D4A5A5] text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                            Sale
                          </div>
                        )}
                        
                        {/* Out of stock badge */}
                        {product.stock === 0 && (
                          <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs font-medium px-3 py-1 rounded-full">
                            Out of Stock
                          </div>
                        )}

                        {/* Quick view overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <p className="text-center text-sm font-medium text-[#111827] flex items-center justify-center gap-2">
                            View Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 px-1">
                        <p className="text-xs uppercase tracking-wider text-[#6B7280]">{product.category}</p>
                        <h3 className="font-normal text-base text-[#111827] group-hover:text-[#D4A5A5] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-medium text-[#111827]">
                            ₨{product.price.toLocaleString()}
                          </p>
                          {product.old_price && (
                            <p className="text-sm text-[#6B7280] line-through">
                              ₨{product.old_price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-[#6B7280] text-lg mb-2">No products found</p>
                <p className="text-[#9CA3AF] text-sm mb-6">Try adjusting your filters to find what you&apos;re looking for</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedGender('all')
                    setSortBy('default')
                  }}
                  className="btn btn-primary"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
