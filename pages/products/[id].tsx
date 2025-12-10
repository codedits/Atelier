import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Header, Footer } from '../../components'
import { useProduct } from '@/hooks/useProducts'

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

  const handleAddToCart = () => {
    if (!product) return
    alert(`Added ${quantity} × ${product.name} to cart`)
  }

  const handleAddToFavorites = () => {
    if (!product) return
    alert(`Added ${product.name} to favorites`)
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
              
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                {/* Main Image */}
                <div className="aspect-square bg-[#F8F7F5] overflow-hidden relative">
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                  
                  {/* Sale Badge */}
                  {product.old_price && (
                    <div className="absolute top-6 left-6 bg-[#D4A5A5] text-white text-sm font-medium px-4 py-2 rounded">
                      Save ${(product.old_price - product.price).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {product.images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`aspect-square bg-[#F8F7F5] overflow-hidden relative border-2 transition-all ${
                          selectedImage === idx ? 'border-[#D4A5A5]' : 'border-transparent hover:border-[#E5E7EB]'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} view ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 12vw, 25vw"
                        />
                      </button>
                    ))}
                  </div>
                )}
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
                        className="w-10 h-10 border border-[#E5E7EB] rounded flex items-center justify-center text-[#111827] hover:border-[#D4A5A5] transition-colors"
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-lg font-medium text-[#111827]">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-10 h-10 border border-[#E5E7EB] rounded flex items-center justify-center text-[#111827] hover:border-[#D4A5A5] transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="flex-1 btn btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button
                      onClick={handleAddToFavorites}
                      className="btn btn-outline py-4 px-6"
                      aria-label="Add to favorites"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

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
