import { memo, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import Image from 'next/image'
import Link from 'next/link'

interface TrendingProduct {
  id: string
  name: string
  slug?: string
  price: number
  old_price?: number
  image_url: string
  images?: string[]
  category: string
}

interface TrendingNowProps {
  products: TrendingProduct[]
}

const TrendingNow = memo(function TrendingNow({ products }: TrendingNowProps) {
  const { ref: sectionRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }, [])

  const scroll = useCallback((dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const cardWidth = 320
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -cardWidth * 2 : cardWidth * 2,
      behavior: 'smooth'
    })
    setTimeout(updateScrollButtons, 400)
  }, [updateScrollButtons])

  if (!products || products.length === 0) return null

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(p)

  return (
    <section className="luxury-section bg-white w-full overflow-hidden" ref={sectionRef}>
      <div className="w-full mx-auto px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div
            className={cn(
              "invisible-before-reveal",
              isIntersecting && "reveal-slide-up"
            )}
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#C9A96E] mb-3 font-semibold">
              ★ Featured
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#1A1A1A] font-serif">
              Most Loved Pieces
            </h2>
          </div>

          {/* Scroll arrows (desktop) */}
          <div
            className={cn(
              "hidden md:flex items-center gap-2 invisible-before-reveal",
              isIntersecting && "reveal-fade-in"
            )}
            style={{ animationDelay: '200ms' }}
          >
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-10 h-10 border border-[#E8E4DF] flex items-center justify-center hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-default disabled:hover:border-[#E8E4DF] disabled:hover:bg-transparent disabled:hover:text-current"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-10 h-10 border border-[#E8E4DF] flex items-center justify-center hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-default disabled:hover:border-[#E8E4DF] disabled:hover:bg-transparent disabled:hover:text-current"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scroll carousel */}
      <div
        ref={scrollRef}
        onScroll={updateScrollButtons}
        className="flex gap-5 overflow-x-auto scrollbar-hide px-6 lg:px-8 pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Left spacer for alignment */}
        <div className="flex-shrink-0 w-0 lg:w-[calc((100vw-80rem)/2)]" />

        {products.map((product, index) => {
          const discount = product.old_price
            ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
            : 0

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug || product.id}`}
              className={cn(
                "group flex-shrink-0 w-[280px] sm:w-[300px] snap-start invisible-before-reveal",
                isIntersecting && "reveal-slide-up"
              )}
              style={{ animationDelay: isIntersecting ? `${index * 80}ms` : '0ms' }}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F0EB] mb-4">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="300px"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {index < 3 && (
                    <span className="bg-[#1A1A1A] text-white text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 font-semibold">
                      Trending
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="bg-[#C9A96E] text-white text-[9px] uppercase tracking-[0.15em] px-2.5 py-1 font-semibold">
                      {discount}% Off
                    </span>
                  )}
                </div>

                {/* Quick view hint */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white font-medium">
                    View Details →
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="px-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#4A4A4A] mb-1">
                  {product.category}
                </p>
                <h3 className="text-sm font-medium text-[#1A1A1A] mb-2 group-hover:text-[#C9A96E] transition-colors duration-300 line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">
                    {formatPrice(product.price)}
                  </span>
                  {product.old_price && (
                    <span className="text-xs text-[#999] line-through">
                      {formatPrice(product.old_price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}

        {/* View all card */}
        <Link
          href="/products"
          className={cn(
            "group flex-shrink-0 w-[280px] sm:w-[300px] snap-start invisible-before-reveal",
            isIntersecting && "reveal-slide-up"
          )}
          style={{ animationDelay: isIntersecting ? `${products.length * 80}ms` : '0ms' }}
        >
          <div className="aspect-[3/4] border border-[#E8E4DF] flex flex-col items-center justify-center gap-6 hover:border-[#1A1A1A] hover:bg-[#FEFDFB] transition-all duration-500">
            <div className="w-12 h-12 border border-[#1A1A1A]/20 flex items-center justify-center group-hover:border-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-all duration-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#1A1A1A] uppercase tracking-[0.15em]">View All</p>
              <p className="text-[11px] text-[#4A4A4A] mt-1">Explore the full collection</p>
            </div>
          </div>
        </Link>

        {/* Right spacer */}
        <div className="flex-shrink-0 w-4 lg:w-[calc((100vw-80rem)/2)]" />
      </div>
    </section>
  )
})

export default TrendingNow
