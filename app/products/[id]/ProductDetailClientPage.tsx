/* eslint-disable react-hooks/purity */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Header, Footer, ProductCarousel } from '../../../components'
import { ProductLightbox } from '@/components/ProductLightbox'
import { useCart } from '@/context/CartContext'
import { useFavorites } from '@/context/FavoritesContext'
import { Product, ProductReview, ProductReviewStats } from '@/lib/supabase'
import { SITE_URL, SITE_NAME } from '@/lib/constants'

const ProductReviews = dynamic(() => import('@/components/ProductReviews'), { ssr: false })
const ProductAccordion = dynamic(() => import('@/components/ProductAccordion'))
const ProductCard = dynamic(() => import('@/components/ProductCard'))
const Craftsmanship = dynamic(() => import('@/components/Craftsmanship'))

interface ProductDetailClientPageProps {
  product: Product & { images?: string[] }
  relatedProducts: Product[]
  reviews: ProductReview[]
  reviewStats: ProductReviewStats | null
}

export default function ProductDetailClientPage({ product, relatedProducts, reviews, reviewStats }: ProductDetailClientPageProps) {
  const { addItem, getItemQuantity } = useCart()
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const galleryImages = useMemo(
    () => (product.images && product.images.length > 0 ? product.images : [product.image_url]),
    [product.images, product.image_url]
  )

  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [stockError, setStockError] = useState(false)
  const [isGalleryLoaded, setIsGalleryLoaded] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const isInFavorites = isFavorite(product.id)
  const currentInCart = getItemQuantity(product.id)
  const maxCanAdd = product.stock > 0
    ? Math.max(0, product.stock - currentInCart)
    : 999
  const isOutOfStock = product.stock > 0 && product.stock <= currentInCart

  const handleAddToCart = () => {
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
      slug: product.slug,
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
    const productData: Product = {
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
      slug: product.slug,
    }
    if (isInFavorites) {
      removeFavorite(product.id)
    } else {
      addFavorite(productData)
    }
  }

  const closeLightbox = useCallback(() => setIsLightboxOpen(false), [])

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }, [])

  useEffect(() => {
    let active = true
    const timeoutId = globalThis.setTimeout(() => {
      if (active) setIsGalleryLoaded(true)
    }, 1500)

    const first = new window.Image()
    first.onload = () => {
      if (active) setIsGalleryLoaded(true)
    }
    first.onerror = () => {
      if (active) setIsGalleryLoaded(true)
    }
    first.src = galleryImages[0]

    // Warm remaining images in the background without blocking first render.
    for (let i = 1; i < galleryImages.length; i += 1) {
      const img = new window.Image()
      img.src = galleryImages[i]
    }

    return () => {
      active = false
      globalThis.clearTimeout(timeoutId)
    }
  }, [galleryImages])

  if (!isGalleryLoaded) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FDFBF7] z-50 selection:bg-transparent">
        <div className="flex flex-col items-center justify-center space-y-8">
          <h1
            className="text-2xl md:text-3xl font-thin tracking-[0.2em] text-[#1A1A1A] uppercase ml-[0.5em]"
            style={{
              fontFamily: '"Cormorant Garamond", "EB Garamond", Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", serif',
              animation: 'gentlePulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          >
            Atelier
          </h1>

          <div className="w-16 h-[1px] bg-black/10 overflow-hidden relative">
            <div
              className="absolute top-0 left-0 w-full h-full bg-[#1A1A1A]"
              style={{
                animation: 'slideRight 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes gentlePulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
              }
              @keyframes slideRight {
                0% { transform: translateX(-101%); }
                50% { transform: translateX(0); }
                100% { transform: translateX(101%); }
              }
            `,
          }}
        />
      </div>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            image: product.images || [product.image_url],
            sku: product.id,
            category: product.category,
            brand: {
              '@type': 'Brand',
              name: SITE_NAME
            },
            offers: {
              '@type': 'Offer',
              url: `${SITE_URL}/products/${product.id}`,
              priceCurrency: 'PKR',
              price: product.price,
              priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition'
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
                { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
                { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}/products/${product.id}` }
              ]
            }
          })
        }}
      />

      <div className="min-h-screen bg-white">
        <Header />

        <main className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="mb-12 animate-fadeIn">
              <ol className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#4A4A4A]">
                <li>
                  <Link href="/" className="hover:text-[#888] transition-colors">Home</Link>
                </li>
                <li className="w-1 h-1 bg-[#1A1A1A] rotate-45" />
                <li>
                  <Link href="/products" className="hover:text-[#888] transition-colors">Collection</Link>
                </li>
                <li className="w-1 h-1 bg-[#1A1A1A] rotate-45" />
                <li className="text-[#1A1A1A] font-medium">{product.name}</li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
              <div className="lg:col-span-7 space-y-6 animate-fadeIn">
                <div className="hidden lg:flex flex-col gap-6">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => openLightbox(idx)}
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
                        <div className="absolute top-6 left-6 bg-[#1A1A1A] text-white text-[10px] font-medium tracking-[0.15em] uppercase px-4 py-2 z-10">
                          Sale
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="lg:hidden">
                  <ProductCarousel
                    images={galleryImages}
                    productName={product.name}
                    saleBadge={product.old_price ? 'Sale' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => openLightbox(0)}
                    className="mt-4 w-full border border-[#E8E4DF] h-12 text-[11px] uppercase tracking-[0.18em] font-medium text-[#1A1A1A] hover:bg-[#FAF9F6] transition-colors"
                  >
                    Open Fullscreen Gallery
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-10 animate-fadeIn">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A] font-medium">
                      {product.category}
                    </p>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium font-serif text-[#1A1A1A] leading-[1.02] tracking-tight">
                      {product.name}
                    </h1>
                  </div>

                  <div className="flex items-baseline gap-6">
                    <p className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#1A1A1A] font-serif">
                      ₨{product.price.toLocaleString()}
                    </p>
                    {product.old_price && (
                      <p className="text-lg md:text-xl text-[#9CA3AF] line-through font-normal">
                        ₨{product.old_price.toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="w-16 h-px bg-gradient-to-r from-[#1A1A1A] to-transparent my-4" />

                  <p className="text-base text-[#4A4A4A] font-normal leading-relaxed max-w-xl">
                    {product.description}
                  </p>

                  <ul className="flex flex-wrap gap-6 mt-4 text-sm text-[#4A4A4A]">
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h4l3 8 4-16 3 8h4" /></svg> Free shipping</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l2 2" /></svg> 30-day returns</li>
                    <li className="flex items-center gap-2"><svg className="w-4 h-4 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg> Warranty</li>
                  </ul>
                </div>

                <div className="space-y-8 pt-4">
                  <div className="flex items-center gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]">
                        Quantity
                      </label>
                      <div className="flex items-center w-36 h-14 border border-[#E8E4DF] px-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:text-[#888] transition-colors disabled:opacity-30"
                          disabled={quantity <= 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="flex-1 text-center text-base font-medium text-[#1A1A1A]">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(maxCanAdd, quantity + 1))}
                          className="w-10 h-10 flex items-center justify-center text-[#1A1A1A] hover:text-[#888] transition-colors disabled:opacity-30"
                          disabled={product.stock > 0 && quantity >= maxCanAdd}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || (product.stock > 0 && maxCanAdd === 0)}
                      className={`relative h-14 md:h-16 w-full overflow-hidden font-medium text-xs tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-3 px-6 ${addedToCart
                        ? 'bg-green-600 text-white'
                        : 'bg-[#1A1A1A] text-white hover:bg-[#333] active:scale-[0.99]'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
                        {addedToCart ? (
                          <span
                            key="added"
                            className="flex items-center justify-center gap-2 animate-in slide-in-from-bottom-4 duration-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Added to Bag
                          </span>
                        ) : (
                          <span
                            key="add"
                            className="animate-in fade-in duration-300"
                          >
                            {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
                          </span>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={handleToggleFavorite}
                      className={`h-14 md:h-16 w-full border font-medium text-xs tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-3 px-4 ${isInFavorites
                        ? 'bg-[#FAF9F6] border-[#1A1A1A] text-[#1A1A1A]'
                        : 'border-[#E8E4DF] text-[#1A1A1A] hover:border-[#1A1A1A] hover:text-[#888]'
                        }`}
                    >
                      <svg className={`w-5 h-5 ${isInFavorites ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {isInFavorites ? 'Saved' : 'Save to Wishlist'}
                    </button>
                  </div>

                  {stockError && (
                    <div
                      className="p-5 bg-red-50 text-red-700 text-sm rounded-2xl flex items-center gap-4 font-poppins animate-in slide-in-from-top-2 duration-300"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Only {maxCanAdd} items left in stock.
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <ProductAccordion
                    details={product.description}
                    materials={product.category === 'Rings' ? '18k Solid Gold, Conflict-free Diamonds' : undefined}
                  />
                </div>

                <div className="grid grid-cols-3 gap-6 pt-10 border-t border-[#E8E4DF]">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-[#FAF9F6] flex items-center justify-center text-[#1A1A1A]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]">Free Shipping</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-[#FAF9F6] flex items-center justify-center text-[#1A1A1A]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]">Authentic</p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-[#FAF9F6] flex items-center justify-center text-[#1A1A1A]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A]">Easy Returns</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-40 -mx-4 sm:-mx-6 lg:-mx-8">
              <Craftsmanship />
            </div>

            {relatedProducts.length > 0 && (
              <section className="mt-40 pt-24 border-t border-[#E8E4DF]">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#1A1A1A] font-medium">Complete the look</p>
                    <h2 className="text-4xl md:text-5xl font-medium text-[#1A1A1A] font-serif">You May Also Like</h2>
                  </div>
                  <Link href="/products" className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A] hover:text-[#333] transition-colors border-b border-[#1A1A1A] pb-2 w-fit">
                    View All Collection
                  </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-12">
                  {relatedProducts.map((item) => (
                    <ProductCard
                      key={item.id}
                      id={item.id}
                      slug={item.slug}
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

            <section className="mt-32 pt-20 border-t border-[#E8E4DF]">
              <ProductReviews productId={product.id} initialReviews={reviews} initialStats={reviewStats} />
            </section>

          </div>
        </main>

        <Footer />
      </div>

      <ProductLightbox
        images={galleryImages}
        initialIndex={lightboxIndex}
        alt={product.name}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
      />
    </>
  )
}