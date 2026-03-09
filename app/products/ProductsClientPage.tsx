/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import { Header, Footer } from '../../components'
import { Product } from '@/lib/supabase'
import { SITE_URL, SITE_NAME } from '@/lib/constants'

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

interface ProductsClientPageProps {
  initialProducts: Product[]
  initialCategory: string | null
  initialGender: string | null
  initialSearch: string | null
}

const ProductGridItem = memo(function ProductGridItem({
  product,
  index
}: {
  product: Product
  index: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  const secondaryImg = product.images && product.images.length > 1 ? product.images[1] : undefined

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
    >
      <Link href={`/products/${product.slug || product.id}`} className="block" prefetch={false}>
        <div className="relative aspect-[4/5] mb-5 overflow-hidden bg-[#F9F8F6]">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ease-out ${isHovered && secondaryImg ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              }`}
            sizes="(min-width:1280px)25vw, (min-width:1024px)33vw, (min-width:640px)50vw, 100vw"
            loading={index < 4 ? 'eager' : 'lazy'}
          />

          {secondaryImg && (
            <Image
              src={secondaryImg}
              alt={`${product.name} - alternate view`}
              fill
              className={`object-cover transition-all duration-700 ease-out ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                }`}
              sizes="(min-width:1280px)25vw, (min-width:1024px)33vw, (min-width:640px)50vw, 100vw"
            />
          )}

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.old_price && (
              <span className="bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest px-2.5 py-1">
                Sale
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-[10px] uppercase tracking-widest px-2.5 py-1 border border-[#E8E4DF]">
                Sold Out
              </span>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <div className="w-full bg-white/90 backdrop-blur-md py-3 text-center text-[11px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A] border border-[#E8E4DF]">
              View Details
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A] font-medium">
            {product.category}
          </p>
          <h3 className="font-serif text-lg text-[#1A1A1A] group-hover:text-[#888] transition-colors duration-300">
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
    </div>
  )
})

export default function ProductsClientPage({
  initialProducts,
  initialCategory,
  initialGender,
  initialSearch,
}: ProductsClientPageProps) {
  const router = useRouter()
  const [products] = useState<Product[]>(initialProducts)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedGender, setSelectedGender] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('default')


  useEffect(() => {
    setSelectedCategory(initialCategory ? initialCategory.toLowerCase() : 'all')
    setSelectedGender(initialGender ? initialGender.toLowerCase() : 'all')
    setSearchQuery(initialSearch ? initialSearch.toLowerCase() : '')
  }, [initialCategory, initialGender, initialSearch])

  const filteredProducts = useMemo(() => {
    const filtered = [...products]

    const searched = searchQuery
      ? filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery)
      )
      : filtered

    const categoryFiltered = selectedCategory !== 'all'
      ? searched.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase())
      : searched

    const genderFiltered = selectedGender !== 'all'
      ? categoryFiltered.filter(p => p.gender.toLowerCase() === selectedGender.toLowerCase())
      : categoryFiltered

    if (sortBy === 'price-low') {
      genderFiltered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      genderFiltered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name') {
      genderFiltered.sort((a, b) => a.name.localeCompare(b.name))
    }

    return genderFiltered
  }, [selectedCategory, selectedGender, searchQuery, sortBy, products])

  const categoryOptions = useMemo(() => [
    'all',
    ...Array.from(new Set(products.map(p => p.category))).sort()
  ], [products])

  const genders = ['all', 'women', 'men']

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
    router.push('/products')
  }, [router])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Shop All Jewelry',
            description: 'Browse our complete collection of luxury handcrafted jewelry',
            url: `${SITE_URL}/products`,
            isPartOf: {
              '@type': 'WebSite',
              name: SITE_NAME,
              url: SITE_URL
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` }
              ]
            }
          })
        }}
      />

      <div className="min-h-screen bg-white">
        <Header />

        <main className="pt-32 pb-24">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div className="max-w-2xl">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#1A1A1A] font-medium mb-4 block">
                    The Collection
                  </span>
                  <h1 className="text-5xl md:text-7xl font-serif text-[#1A1A1A] leading-[1.1] mb-6">
                    {searchQuery ? `Results for "${searchQuery}"` : 'All Creations'}
                  </h1>
                  <div className="w-16 h-px bg-gradient-to-r from-[#1A1A1A] to-transparent mb-6" />
                  <p className="text-base text-[#4A4A4A] leading-relaxed">
                    {searchQuery
                      ? `Discover our pieces matching your search for "${searchQuery}". Each creation is handcrafted with precision and care.`
                      : 'Explore our curated selection of handcrafted jewelry, where traditional craftsmanship meets contemporary elegance.'
                    }
                  </p>
                </div>
              </div>

              <div className="hidden md:block animate-in fade-in duration-500 delay-300 fill-mode-both">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#AAA]">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
                </p>
              </div>
            </div>

            <div className="sticky top-[112px] z-30 bg-white/90 backdrop-blur-md border-y border-[#E8E4DF] mb-12 py-4">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A] font-medium">Category</span>
                      <ChevronDown className="w-3 h-3 text-[#1A1A1A]" />
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
                    <div className="mt-0.5 text-[10px] text-[#1A1A1A] uppercase tracking-wider">
                      {selectedCategory === 'all' ? 'All' : selectedCategory}
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A] font-medium">For</span>
                      <ChevronDown className="w-3 h-3 text-[#1A1A1A]" />
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
                    <div className="mt-0.5 text-[10px] text-[#1A1A1A] uppercase tracking-wider">
                      {selectedGender === 'all' ? 'Everyone' : selectedGender}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="relative group">
                    <div className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A] font-medium">Sort By</span>
                      <ChevronDown className="w-3 h-3 text-[#1A1A1A]" />
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
                    <div className="mt-0.5 text-[10px] text-[#1A1A1A] uppercase tracking-wider">
                      {sortBy === 'default' ? 'Default' : sortBy.replace('-', ' ')}
                    </div>
                  </div>

                  {searchQuery && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF9F6] border border-[#E8E4DF]">
                      <span className="text-[10px] uppercase tracking-wider text-[#4A4A4A]">Search:</span>
                      <span className="text-[10px] font-medium text-[#1A1A1A]">{searchQuery}</span>
                      <button onClick={() => {
                        setSearchQuery('')
                        router.push('/products')
                      }}>
                        <XIcon className="w-3 h-3 text-[#AAA] hover:text-[#888] transition-colors" />
                      </button>
                    </div>
                  )}

                  {(selectedCategory !== 'all' || selectedGender !== 'all' || searchQuery || sortBy !== 'default') && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#333] transition-colors"
                    >
                      <XIcon className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="min-h-[400px]">
              {filteredProducts.length > 0 ? (
                <div
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-12 sm:gap-y-16"
                >
                  {filteredProducts.map((product, index) => (
                    <ProductGridItem key={product.id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <div
                  className="text-center py-32 animate-in fade-in slide-in-from-top-4 duration-300"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FAF9F6] mb-8">
                    <FilterIcon className="w-8 h-8 text-[#1A1A1A]" />
                  </div>
                  <h3 className="font-serif text-2xl text-[#1A1A1A] mb-4">No pieces found</h3>
                  <p className="text-[#4A4A4A] mb-10 max-w-md mx-auto text-sm">
                    We couldn&apos;t find any jewelry matching your current filters. Try adjusting your selection or clear all filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-luxury group"
                  >
                    <span>Clear All Filters</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}