import Head from 'next/head'
import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { GetStaticProps } from 'next'
import { motion, AnimatePresence } from 'framer-motion'
import { Header, Footer } from '../../components'
import { supabase } from '@/lib/supabase'

// Inline SVG Icons to avoid extra dependencies
const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
)

interface Product {
  id: string
  name: string
  description: string
  price: number
  old_price?: number
  category: string
  gender: string
  image_url: string
  images?: string[] // Array of image URLs for rollover effect
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

// Memoized product card for grid - prevents unnecessary re-renders
const ProductGridItem = memo(function ProductGridItem({ 
  product, 
  index 
}: { 
  product: Product
  index: number 
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Get secondary image from images array (index 1)
  const secondaryImg = product.images && product.images.length > 1 ? product.images[1] : undefined
  
  // Memoized handlers to prevent re-renders
  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.5) }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group"
    >
      <Link href={`/products/${product.id}`} className="block" prefetch={false}>
        <div className="relative aspect-[4/5] mb-5 overflow-hidden bg-[#F9F8F6]">
          {/* Primary Image */}
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ease-out ${
              isHovered && secondaryImg ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
            }`}
            sizes="(min-width:1280px)25vw, (min-width:1024px)33vw, (min-width:640px)50vw, 100vw"
            loading={index < 4 ? 'eager' : 'lazy'}
          />
          
          {/* Secondary Image */}
          {secondaryImg && (
            <Image
              src={secondaryImg}
              alt={`${product.name} - alternate view`}
              fill
              className={`object-cover transition-all duration-700 ease-out ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
              sizes="(min-width:1280px)25vw, (min-width:1024px)33vw, (min-width:640px)50vw, 100vw"
            />
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.old_price && (
              <span className="bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest px-2.5 py-1">
                Sale
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-[10px] uppercase tracking-widest px-2.5 py-1 border border-black/5">
                Sold Out
              </span>
            )}
          </div>

          {/* Quick View Button - Minimalist */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <div className="w-full bg-white/90 backdrop-blur-md py-3 text-center text-[11px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A] border border-black/5">
              View Details
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] font-medium">
            {product.category}
          </p>
          <h3 className="font-display text-lg text-[#1A1A1A] group-hover:text-[#888] transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-center justify-center gap-3">
            <p className="text-sm font-medium text-[#1A1A1A]">
              ₨{product.price.toLocaleString()}
            </p>
            {product.old_price && (
              <p className="text-sm text-[#AAA] line-through decoration-[#AAA]/50">
                ₨{product.old_price.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
})

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
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')

  // Read filters from URL query params on mount
  useEffect(() => {
    if (router.isReady) {
      const { category, gender, search } = router.query
      if (category && typeof category === 'string') {
        setSelectedCategory(category.toLowerCase())
      }
      if (gender && typeof gender === 'string') {
        setSelectedGender(gender.toLowerCase())
      }
      if (search && typeof search === 'string') {
        setSearchQuery(search.toLowerCase())
      } else {
        setSearchQuery('')
      }
    }
  }, [router.isReady, router.query])

  // Memoized filtered products for performance
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery) || 
        p.description.toLowerCase().includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery)
      )
    }

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
  }, [selectedCategory, selectedGender, searchQuery, sortBy, products])

  // Generate category options from API categories plus existing product categories
  const categoryOptions = useMemo(() => [
    'all',
    ...Array.from(new Set([
      ...categories.map(c => c.name),
      ...products.map(p => p.category)
    ]))
  ], [categories, products])
  
  const genders = ['all', 'women', 'men']

  // Memoized filter handlers
  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value)
  }, [])

  const handleGenderChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGender(e.target.value)
  }, [])

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedCategory('all')
    setSelectedGender('all')
    setSearchQuery('')
    setSortBy('default')
    // Also clear the URL query params
    router.push('/products', undefined, { shallow: true })
  }, [router])

  return (
    <>
      <Head>
        <title>Shop All Jewelry — Rings, Necklaces, Bracelets & Earrings | Atelier</title>
        <meta name="description" content="Browse our complete collection of luxury handcrafted jewelry. Shop fine rings, elegant necklaces, stunning bracelets, and exquisite earrings with free shipping." />
        <meta name="keywords" content="jewelry shop, buy rings, gold necklaces, diamond bracelets, earrings online, luxury jewelry store" />
        <meta property="og:title" content="Shop All Jewelry | Atelier Fine Jewellery" />
        <meta property="og:description" content="Browse our complete collection of handcrafted jewelry. Rings, necklaces, bracelets, and earrings." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_APP_URL || 'https://atelier-amber.vercel.app'}/products`} />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://atelier-amber.vercel.app'}/products`} />
        
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

      <div className="min-h-screen bg-white font-poppins">
        <Header />

        <main className="pt-32 pb-24">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            
            {/* Editorial Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#888] font-medium mb-4 block">
                    The Collection
                  </span>
                  <h1 className="text-5xl md:text-7xl font-display text-[#1A1A1A] leading-[1.1] mb-6">
                    {searchQuery ? `Results for "${searchQuery}"` : 'All Creations'}
                  </h1>
                  <p className="text-lg text-[#666] leading-relaxed font-light">
                    {searchQuery 
                      ? `Discover our pieces matching your search for "${searchQuery}". Each creation is handcrafted with precision and care.`
                      : 'Explore our curated selection of handcrafted jewelry, where traditional craftsmanship meets contemporary elegance. Each piece is a testament to our commitment to beauty and quality.'
                    }
                  </p>
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="hidden md:block"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#AAA]">
                  Showing {filteredProducts.length} Results
                </p>
              </motion.div>
            </div>

            {/* Refined Filter Bar */}
            <div className="sticky top-[80px] z-30 bg-white/80 backdrop-blur-md border-y border-[#EEE] mb-12 py-4">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                  {/* Category Filter */}
                  <div className="relative group">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A] font-medium">Category</span>
                      <ChevronDown className="w-3 h-3 text-[#AAA]" />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat} value={cat}>
                          {cat === 'all' ? 'All Categories' : cat}
                        </option>
                      ))}
                    </select>
                    <div className="mt-0.5 text-[10px] text-[#888] uppercase tracking-wider">
                      {selectedCategory === 'all' ? 'All' : selectedCategory}
                    </div>
                  </div>

                  {/* Gender Filter */}
                  <div className="relative group">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A] font-medium">For</span>
                      <ChevronDown className="w-3 h-3 text-[#AAA]" />
                    </div>
                    <select
                      value={selectedGender}
                      onChange={handleGenderChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                      {genders.map(gender => (
                        <option key={gender} value={gender}>
                          {gender === 'all' ? 'Everyone' : gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </option>
                      ))}
                    </select>
                    <div className="mt-0.5 text-[10px] text-[#888] uppercase tracking-wider">
                      {selectedGender === 'all' ? 'Everyone' : selectedGender}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  {/* Sort */}
                  <div className="relative group">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A] font-medium">Sort By</span>
                      <ChevronDown className="w-3 h-3 text-[#AAA]" />
                    </div>
                    <select
                      value={sortBy}
                      onChange={handleSortChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    >
                      <option value="default">Default</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A-Z</option>
                    </select>
                    <div className="mt-0.5 text-[10px] text-[#888] uppercase tracking-wider">
                      {sortBy === 'default' ? 'Default' : sortBy.replace('-', ' ')}
                    </div>
                  </div>

                  {searchQuery && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#F9F8F6] border border-[#EEE]">
                      <span className="text-[10px] uppercase tracking-wider text-[#888]">Search:</span>
                      <span className="text-[10px] font-medium text-[#1A1A1A]">{searchQuery}</span>
                      <button onClick={() => {
                        setSearchQuery('')
                        router.push('/products', undefined, { shallow: true })
                      }}>
                        <XIcon className="w-3 h-3 text-[#AAA] hover:text-[#1A1A1A]" />
                      </button>
                    </div>
                  )}

                  {(selectedCategory !== 'all' || selectedGender !== 'all' || searchQuery || sortBy !== 'default') && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#B91C1C] hover:text-[#991B1B] transition-colors"
                    >
                      <XIcon className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <AnimatePresence mode="wait">
              {filteredProducts.length > 0 ? (
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
                >
                  {filteredProducts.map((product, index) => (
                    <ProductGridItem key={product.id} product={product} index={index} />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-32"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#F9F8F6] mb-8">
                    <FilterIcon className="w-8 h-8 text-[#AAA]" />
                  </div>
                  <h3 className="font-display text-2xl text-[#1A1A1A] mb-4">No pieces found</h3>
                  <p className="text-[#666] mb-10 max-w-md mx-auto">
                    We couldn&apos;t find any jewelry matching your current filters. Try adjusting your selection or clear all filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.2em] hover:bg-[#333] transition-colors"
                  >
                    Clear All Filters
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
