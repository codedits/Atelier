import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Header, Footer } from '../../components'
import { useProduct } from '@/hooks/useProducts'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'

// Sample product data - replace with API call
const productData: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Diamond Solitaire Ring',
    price: 18500,
    old_price: 22000,
    category: 'Rings',
    gender: 'women',
    description: 'A stunning solitaire ring featuring a brilliant-cut diamond set in platinum. This timeless piece showcases exceptional craftsmanship and is perfect for engagements or special occasions.',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop'
    ],
    stock: 5,
    details: {
      material: 'Platinum',
      stone: 'Diamond (1.5ct)',
      dimensions: '6mm band width',
      care: 'Clean with soft cloth, avoid harsh chemicals'
    }
  },
  '2': {
    id: '2',
    name: 'Pearl Elegance Necklace',
    price: 4200,
    category: 'Necklaces',
    gender: 'women',
    description: 'Elegant freshwater pearl necklace with a 14k gold clasp. Each pearl is hand-selected for its luster and perfectly matched to create a harmonious strand.',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop'
    ],
    stock: 8,
    details: {
      material: '14K Yellow Gold',
      stone: 'Freshwater Pearls',
      dimensions: '18 inch length',
      care: 'Wipe with damp cloth after wearing'
    }
  },
  '3': {
    id: '3',
    name: 'Gold Chain Bracelet',
    price: 3800,
    category: 'Bracelets',
    gender: 'women',
    description: 'Delicate 18k gold chain bracelet with secure lobster clasp. A versatile piece that can be worn alone or layered with other bracelets.',
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1200&auto=format&fit=crop'
    ],
    stock: 12,
    details: {
      material: '18K Yellow Gold',
      stone: 'None',
      dimensions: '7.5 inch length',
      care: 'Polish with jewelry cloth'
    }
  }
}

export default function ProductDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const { product: fetchedProduct, loading, error } = useProduct(
    typeof id === 'string' ? id : undefined
  )
  const { addItem } = useCart()
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()

  // fallback to local sample data for development when API has no product
  const rawProduct = fetchedProduct ?? (id ? productData[id as string] : null)

  // Normalize product: ensure images array exists, derive from image_url if needed
  const product = rawProduct ? {
    ...rawProduct,
    images: rawProduct.images && rawProduct.images.length > 0
      ? rawProduct.images
      : rawProduct.image_url
        ? [rawProduct.image_url]
        : ['https://via.placeholder.com/600?text=No+Image'],
    stock: rawProduct.stock ?? 0,
    price: rawProduct.price ?? 0,
  } : null

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [stockError, setStockError] = useState(false)

  const isInFavorites = product ? isFavorite(product.id) : false
  
  // Get current quantity in cart for this product
  const { getItemQuantity, canAddMore } = useCart()
  const currentInCart = product ? getItemQuantity(product.id) : 0
  const maxCanAdd = product && product.stock > 0 
    ? Math.max(0, product.stock - currentInCart) 
    : 999
  const isOutOfStock = product && product.stock > 0 && product.stock <= currentInCart

  const handleAddToCart = () => {
    if (!product) return
    
    // Check stock before adding
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
      image_url: product.images[0],
      stock: product.stock,
      created_at: new Date().toISOString(),
    }, quantity)
    
    if (added) {
      setAddedToCart(true)
      setQuantity(1) // Reset quantity after adding
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
      image_url: product.images[0],
      stock: product.stock,
      created_at: new Date().toISOString(),
    }
    if (isInFavorites) {
      removeFavorite(product.id)
    } else {
      addFavorite(productData)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-2xl font-medium text-[#111827] mb-4">Loading...</h1>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product || error) {
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

  return (
    <>
      <Head>
        <title>{product.name} — Atelier Fine Jewellery</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.images[0]} />
      </Head>

      <div className="min-h-screen bg-white">
        <Header />

        <main className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              
              {/* Image Gallery - simple prev/next viewer */}
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="w-full bg-[#F8F7F5] relative rounded-lg overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
                  <div className="absolute inset-0">
                    <Image
                      key={selectedImage}
                      src={product.images[selectedImage]}
                      alt={`${product.name} view ${selectedImage + 1}`}
                      fill
                      className="object-cover object-center"
                      priority
                      sizes="(min-width: 1024px) 50vw, 100vw"
                    />
                  </div>

                  {/* Sale Badge */}
                  {product.old_price && (
                    <div className="absolute top-6 left-6 bg-[#D4A5A5] text-white text-sm font-medium px-4 py-2 rounded z-10">
                      Save ${(product.old_price - product.price).toLocaleString()}
                    </div>
                  )}

                  {/* Prev / Next buttons - simple wrap-around */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        aria-label="Previous image"
                        onClick={() => setSelectedImage(si => (si - 1 + product.images.length) % product.images.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <button
                        aria-label="Next image"
                        onClick={() => setSelectedImage(si => (si + 1) % product.images.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Category & Title */}
                <div>
                  <p className="text-sm uppercase tracking-wider text-[#D4A5A5] mb-2">{product.category}</p>
                  <h1 className="text-4xl md:text-5xl font-medium text-[#111827] mb-4">
                    {product.name}
                  </h1>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <p className="text-3xl font-medium text-[#111827]">
                      ${product.price.toLocaleString()}
                    </p>
                    {product.old_price && (
                      <p className="text-xl text-[#6B7280] line-through">
                        ${product.old_price.toLocaleString()}
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
                    {Object.entries(product.details || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-[#E5E7EB] last:border-0">
                        <p className="text-sm text-[#6B7280] capitalize">{key}</p>
                        <p className="text-sm text-[#111827] font-medium">{value as string}</p>
                      </div>
                    ))}
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
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded">
                      Not enough stock available. Maximum you can add: {maxCanAdd}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || (product.stock > 0 && maxCanAdd === 0)}
                      className={`flex-1 py-4 font-medium transition-all ${
                        addedToCart 
                          ? 'bg-green-600 text-white' 
                          : 'bg-[#1A1A1A] text-white hover:bg-[#333]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {addedToCart 
                        ? '✓ Added to Cart' 
                        : isOutOfStock 
                          ? 'Out of Stock'
                          : product.stock > 0 && maxCanAdd === 0
                            ? 'Max in Cart'
                            : 'Add to Cart'}
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
                      Free shipping on orders over $100
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
