import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GetStaticProps, GetStaticPaths } from 'next'
import { Header, Footer, ProductCarousel } from '../../components'
import ProductReviews from '@/components/ProductReviews'
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
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Link href="/" className="hover:text-[#D4A5A5] transition-colors">Home</Link>
                <span>/</span>
                <Link href="/products" className="hover:text-[#D4A5A5] transition-colors">Products</Link>
                <span>/</span>
                <span className="text-[#111827]">{product.name}</span>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ProductCarousel
                  images={product.images || [product.image_url]}
                  productName={product.name}
                  saleBadge={product.old_price ? `Save ₨${(product.old_price - product.price).toLocaleString()}` : undefined}
                />
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                {/* Category & Title */}
                <div>
                  <p className="text-sm uppercase tracking-wider text-[#D4A5A5] mb-2">{product.category}</p>
                  <h1 className="text-3xl md:text-4xl lg:text-4xl font-medium text-[#111827] mb-4">
                    {product.name}
                  </h1>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <p className="text-2xl md:text-3xl font-medium text-[#111827]">
                      ₨{product.price.toLocaleString()}
                    </p>
                    {product.old_price && (
                      <p className="text-xl text-[#6B7280] line-through">
                        ₨{product.old_price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-[#E5E7EB] pt-6">
                  <p className="text-base text-[#6B7280] leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Product Details */}
                <div className="border-t border-[#E5E7EB] pt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#111827] mb-4">
                    Product Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                      <p className="text-sm text-[#6B7280]">Category</p>
                      <p className="text-sm text-[#111827] font-medium capitalize">{product.category}</p>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
                      <p className="text-sm text-[#6B7280]">Style</p>
                      <p className="text-sm text-[#111827] font-medium capitalize">{product.gender}</p>
                    </div>
                    <div className="flex justify-between py-2">
                      <p className="text-sm text-[#6B7280]">Availability</p>
                      <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantity & Actions */}
                <div className="border-t border-[#E5E7EB] pt-6 space-y-4">
                  {/* Quantity Selector */}
                  <div>
                    <label className="text-sm font-semibold uppercase tracking-wider text-[#111827] mb-3 block">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 border border-[#E5E7EB] rounded flex items-center justify-center text-[#111827] hover:border-[#D4A5A5] transition-colors disabled:opacity-50"
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-lg font-medium text-[#111827]">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(maxCanAdd, quantity + 1))}
                        className="w-10 h-10 border border-[#E5E7EB] rounded flex items-center justify-center text-[#111827] hover:border-[#D4A5A5] transition-colors disabled:opacity-50"
                        disabled={product.stock > 0 && quantity >= maxCanAdd}
                      >
                        +
                      </button>
                    </div>
                    {currentInCart > 0 && (
                      <p className="text-xs text-[#6B7280] mt-2">
                        You have {currentInCart} in your cart
                      </p>
                    )}
                  </div>
                  
                  {/* Stock/Error Messages */}
                  {stockError && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Not enough stock available. Maximum you can add: {maxCanAdd}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || (product.stock > 0 && maxCanAdd === 0)}
                      className={`flex-1 py-4 font-medium transition-all rounded ${
                        addedToCart 
                          ? 'bg-green-600 text-white' 
                          : 'bg-[#1A1A1A] text-white hover:bg-[#333] hover:shadow-lg'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {addedToCart ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Added to Cart
                        </span>
                      ) : isOutOfStock ? (
                        'Out of Stock'
                      ) : product.stock > 0 && maxCanAdd === 0 ? (
                        'Max in Cart'
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          Add to Cart
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleToggleFavorite}
                      className={`py-4 px-6 border transition-colors ${
                        isInFavorites 
                          ? 'bg-[#D4A5A5] border-[#D4A5A5] text-white' 
                          : 'border-[#E5E7EB] text-[#111827] hover:border-[#D4A5A5]'
                      }`}
                      aria-label={isInFavorites ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg className="w-5 h-5" fill={isInFavorites ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* View Cart Link */}
                  {addedToCart && (
                    <Link href="/cart" className="block text-center text-sm text-[#D4A5A5] hover:underline">
                      View Cart →
                    </Link>
                  )}

                  {/* Additional Info */}
                  <div className="pt-4 space-y-2 text-sm text-[#6B7280]">
                    <p className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Free shipping on orders over ₨5,000
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      30-day return policy
                    </p>
                    <p className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Lifetime authenticity guarantee
                    </p>
                  </div>
                </div>

              </motion.div>
            </div>

            {/* Customer Reviews Section */}
            <ProductReviews productId={product.id} />

            {/* Related Products Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-24 border-t border-[#E5E7EB] pt-16"
            >
              <h2 className="text-3xl font-medium text-[#111827] mb-8 text-center">
                You May Also Like
              </h2>
              <div className="text-center">
                <Link href="/products" className="btn btn-outline">
                  View All Products
                </Link>
              </div>
            </motion.div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  )
}
