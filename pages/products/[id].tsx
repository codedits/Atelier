import Head from 'next/head'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { GetStaticProps, GetStaticPaths } from 'next'
import { Header, Footer, ProductCarousel, Craftsmanship } from '../../components'
import ProductReviews from '@/components/ProductReviews'
import ProductAccordion from '@/components/ProductAccordion'
import ProductCard from '@/components/ProductCard'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { supabase, Product } from '@/lib/supabase'

interface ProductDetailPageProps {
  product: Product & { images?: string[] } | null
}

// Generate static paths for all products
export const getStaticPaths: GetStaticPaths = async () => {
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .or('is_hidden.is.null,is_hidden.eq.false')
    .limit(100) // Pre-build top 100 products

  const paths = (products || []).map((p) => ({
    params: { id: p.id },
  }))

  return {
    paths,
    fallback: 'blocking', // SSR on-demand for new products
  }
}

// ISR: Fetch product data at build time, revalidate every 60 seconds
export const getStaticProps: GetStaticProps<ProductDetailPageProps> = async ({ params }) => {
  const id = params?.id as string

  if (!id) {
    return { notFound: true }
  }

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    return { notFound: true }
  }

  // Normalize images array
  const normalizedProduct = {
    ...product,
    images: product.images && product.images.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : ['https://via.placeholder.com/600?text=No+Image'],
  }

  return {
    props: {
      product: normalizedProduct,
    },
    revalidate: 60, // Revalidate every 60 seconds
  }
}

export default function ProductDetailPage({ product }: ProductDetailPageProps) {
  const router = useRouter()
  const { addItem, getItemQuantity } = useCart()
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()

  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [stockError, setStockError] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoadingRelated, setIsLoadingRelated] = useState(true)

  // Fetch related products
  useEffect(() => {
    if (product) {
      const fetchRelated = async () => {
        setIsLoadingRelated(true)
        try {
          const { data } = await supabase
            .from('products')
            .select('*')
            .eq('category', product.category)
            .neq('id', product.id)
            .limit(4)
          
          if (data) setRelatedProducts(data)
        } catch (error) {
          console.error('Error fetching related products:', error)
        } finally {
          setIsLoadingRelated(false)
        }
      }
      fetchRelated()
    }
  }, [product])

  // Handle fallback loading state
  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Skeleton loader */}
              <div className="aspect-square bg-gray-100 skeleton rounded-lg" />
              <div className="space-y-4">
                <div className="h-4 w-24 skeleton rounded" />
                <div className="h-10 w-3/4 skeleton rounded" />
                <div className="h-8 w-32 skeleton rounded" />
                <div className="h-24 w-full skeleton rounded mt-6" />
                <div className="h-12 w-full skeleton rounded mt-6" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-2xl font-medium text-[#111827] mb-4">Product not found</h1>
          <Link href="/products" className="btn btn-primary">
            Browse All Products
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const isInFavorites = isFavorite(product.id)
  const currentInCart = getItemQuantity(product.id)
  const maxCanAdd = product.stock > 0 
    ? Math.max(0, product.stock - currentInCart) 
    : 999
  const isOutOfStock = product.stock > 0 && product.stock <= currentInCart

  const handleAddToCart = () => {
    if (!product) return
    
    if (product.stock > 0 && quantity > maxCanAdd) {
      setStockError(true)
      setTimeout(() => setStockError(false), 3000)
      return
    }
    
    const added = addItem({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      old_price: product.old_price,
      category: product.category,
      gender: product.gender || 'unisex',
      image_url: product.images?.[0] || product.image_url,
      stock: product.stock,
      created_at: product.created_at,
    }, quantity)
    
    if (added) {
      setAddedToCart(true)
      setQuantity(1)
      setTimeout(() => setAddedToCart(false), 2000)
    } else {
      setStockError(true)
      setTimeout(() => setStockError(false), 3000)
    }
  }

  const handleToggleFavorite = () => {
    if (!product) return
    const productData = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      old_price: product.old_price,
      category: product.category,
      gender: product.gender || 'unisex',
      image_url: product.images?.[0] || product.image_url,
      stock: product.stock,
      created_at: product.created_at,
    }
    if (isInFavorites) {
      removeFavorite(product.id)
    } else {
      addFavorite(productData)
    }
  }

  return (
    <>
      <Head>
        <title>{product.name} — Buy Luxury Jewelry | Atelier Fine Jewellery</title>
        <meta name="description" content={`${product.description?.slice(0, 155)}...` || `Shop ${product.name} - handcrafted luxury ${product.category?.toLowerCase()} from Atelier Fine Jewellery.`} />
        <meta name="keywords" content={`${product.name}, ${product.category}, luxury jewelry, fine jewellery, handcrafted, buy online`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${product.name} | Atelier Fine Jewellery`} />
        <meta property="og:description" content={product.description || `Shop ${product.name} from Atelier`} />
        <meta property="og:image" content={product.images?.[0] || product.image_url} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="1200" />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://codedits.github.io/Atelier/products/${product.id}`} />
        <meta property="product:price:amount" content={product.price?.toString()} />
        <meta property="product:price:currency" content="PKR" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | Atelier`} />
        <meta name="twitter:description" content={product.description || `Shop ${product.name}`} />
        <meta name="twitter:image" content={product.images?.[0] || product.image_url} />
        
        <link rel="canonical" href={`https://codedits.github.io/Atelier/products/${product.id}`} />
        
        {/* Animations are loaded from globals.css for better caching */}
        
        {/* JSON-LD Product Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": product.images || [product.image_url],
          "sku": product.id,
          "category": product.category,
          "brand": {
            "@type": "Brand",
            "name": "Atelier Fine Jewellery"
          },
          "offers": {
            "@type": "Offer",
            "url": `https://codedits.github.io/Atelier/products/${product.id}`,
            "priceCurrency": "PKR",
            "price": product.price,
            "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
          },
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://codedits.github.io/Atelier" },
              { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://codedits.github.io/Atelier/products" },
              { "@type": "ListItem", "position": 3, "name": product.name, "item": `https://codedits.github.io/Atelier/products/${product.id}` }
            ]
          }
        }) }} />
      </Head>

      <div className="min-h-screen bg-white">
        <Header />

        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Breadcrumb - Elegant & Minimal */}
            <nav className="mb-12 animate-fadeIn">
              <ol className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#6B7280]">
                <li>
                  <Link href="/" className="hover:text-[#7A4A2B] transition-colors">Home</Link>
                </li>
                <li className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                <li>
                  <Link href="/products" className="hover:text-[#7A4A2B] transition-colors">Collection</Link>
                </li>
                <li className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                <li className="text-[#1A1A1A] font-medium font-poppins">{product.name}</li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
              
              {/* Left Column: Image Gallery (larger on desktop) */}
              <div className="lg:col-span-7 space-y-6 animate-fadeIn">
                <div className="hidden lg:flex flex-col gap-6">
                  {(product.images || [product.image_url]).map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative w-full bg-[#F8F7F5] rounded-lg overflow-hidden shadow-sm"
                      style={{ aspectRatio: '4 / 5' }}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - View ${idx + 1}`}
                        fill
                        className="object-cover object-center hover:scale-105 transition-transform duration-700"
                        sizes="50vw"
                        priority={idx === 0}
                      />
                      {idx === 0 && product.old_price && (
                        <div className="absolute top-6 left-6 bg-[#B91C1C] text-white text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full shadow-lg z-10 font-poppins">
                          Sale
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile Carousel (Visible only on mobile) */}
                <div className="lg:hidden">
                  <ProductCarousel
                    images={product.images || [product.image_url]}
                    productName={product.name}
                    saleBadge={product.old_price ? `Sale` : undefined}
                  />
                </div>
              </div>

              {/* Right Column: Product Info (Sticky) */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-10 animate-fadeIn">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#7A4A2B] font-bold font-poppins">
                      {product.category}
                    </p>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium font-display text-[#1A1A1A] leading-[1.02] tracking-tight">
                      {product.name}
                    </h1>
                  </div>
                  
                  <div className="flex items-baseline gap-6">
                    <p className="text-3xl md:text-4xl lg:text-5xl font-semibold font-display text-[#1A1A1A]">
                      ₨{product.price.toLocaleString()}
                    </p>
                    {product.old_price && (
                      <p className="text-lg md:text-xl text-[#9CA3AF] line-through font-normal font-poppins">
                        ₨{product.old_price.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="w-16 h-[1px] bg-[#7A4A2B]/30 my-4" />

                  <p className="text-lg text-[#374151] font-normal font-poppins leading-relaxed max-w-xl">
                    {product.description}
                  </p>

                  <ul className="flex flex-wrap gap-6 mt-4 text-sm text-[#374151]">
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#7A4A2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h4l3 8 4-16 3 8h4" /></svg> Free shipping</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#7A4A2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l2 2" /></svg> 30-day returns</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#7A4A2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg> Warranty</li>
                  </ul>
                </div>

                {/* Actions Section */}
                <div className="space-y-8 pt-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold font-poppins text-[#1A1A1A]">
                        Quantity
                      </label>
                      <div className="flex items-center w-36 h-14 border border-[#E5E7EB] rounded-full px-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:text-[#7A4A2B] transition-colors disabled:opacity-30"
                          disabled={quantity <= 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="flex-1 text-center text-base font-medium font-poppins text-[#1A1A1A]">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(maxCanAdd, quantity + 1))}
                          className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:text-[#7A4A2B] transition-colors disabled:opacity-30"
                          disabled={product.stock > 0 && quantity >= maxCanAdd}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Main Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || (product.stock > 0 && maxCanAdd === 0)}
                      className={`relative h-14 md:h-16 w-full overflow-hidden rounded-lg font-semibold font-poppins transition-all duration-300 flex items-center justify-center gap-3 px-6 ${
                        addedToCart 
                          ? 'bg-green-600 text-white' 
                          : 'bg-[#1A1A1A] text-white hover:bg-[#7A4A2B] shadow-lg active:scale-[0.99]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <AnimatePresence mode="wait">
                        {addedToCart ? (
                          <motion.span
                            key="added"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Added to Bag
                          </motion.span>
                        ) : (
                          <motion.span
                            key="add"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                          >
                            {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>

                    <button
                      onClick={handleToggleFavorite}
                      className={`h-14 md:h-16 w-full rounded-lg border font-semibold font-poppins transition-all duration-300 flex items-center justify-center gap-3 px-4 ${
                        isInFavorites 
                          ? 'bg-[#F8F7F5] border-[#7A4A2B] text-[#7A4A2B]' 
                          : 'border-[#E5E7EB] text-[#1A1A1A] hover:border-[#7A4A2B] hover:text-[#7A4A2B]'
                      }`}
                    >
                      <svg className={`w-5 h-5 ${isInFavorites ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {isInFavorites ? 'Saved' : 'Save to Wishlist'}
                    </button>
                  </div>

                  {/* Stock Error Message */}
                  {stockError && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-red-50 text-red-700 text-sm rounded-2xl flex items-center gap-4 font-poppins"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Only {maxCanAdd} items left in stock.
                    </motion.div>
                  )}
                </div>

                {/* Product Accordion */}
                <div className="pt-4">
                  <ProductAccordion 
                    details={product.description}
                    materials={product.category === 'Rings' ? '18k Solid Gold, Conflict-free Diamonds' : undefined}
                  />
                </div>

                {/* Trust Badges - Refined */}
                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-[#F3F4F6]">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-[#F8F7F5] rounded-full flex items-center justify-center text-[#7A4A2B]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold font-poppins text-[#1A1A1A]">Free Shipping</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-[#F8F7F5] rounded-full flex items-center justify-center text-[#7A4A2B]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold font-poppins text-[#1A1A1A]">Authentic</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-[#F8F7F5] rounded-full flex items-center justify-center text-[#7A4A2B]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold font-poppins text-[#1A1A1A]">Easy Returns</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Craftsmanship Section - Full Width Elegant Break */}
            <div className="mt-40 -mx-4 sm:-mx-6 lg:-mx-8">
              <Craftsmanship />
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <section className="mt-40 pt-24 border-t border-[#F3F4F6]">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#7A4A2B] font-bold font-poppins">Complete the look</p>
                    <h2 className="text-4xl md:text-5xl font-medium font-display text-[#1A1A1A]">You May Also Like</h2>
                  </div>
                  <Link href="/products" className="text-xs uppercase tracking-[0.2em] font-bold font-poppins text-[#1A1A1A] hover:text-[#7A4A2B] transition-colors border-b border-[#1A1A1A] pb-2 w-fit">
                    View All Collection
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
                  {relatedProducts.map((item) => (
                    <ProductCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      price={item.price}
                      img={item.image_url}
                      images={item.images}
                      category={item.category}
                      oldPrice={item.old_price}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Customer Reviews Section */}
            <section className="mt-32 pt-20 border-t border-[#F3F4F6]">
              <ProductReviews productId={product.id} />
            </section>

          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
