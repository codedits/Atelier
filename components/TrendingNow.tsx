import { memo, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import Image from 'next/image'
import Link from 'next/link'
import ProductCard from './ProductCard'

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
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [hasMoved, setHasMoved] = useState(false)

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setHasMoved(false)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeft(scrollRef.current.scrollLeft)
    scrollRef.current.style.cursor = 'grabbing'
    scrollRef.current.style.userSelect = 'none'
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 2.0

    if (Math.abs(walk) > 5) {
      setHasMoved(true)
    }

    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUpOrLeave = (e: React.MouseEvent) => {
    if (isDragging && hasMoved) {
      // If we moved significantly, prevent the default click behavior
      e.preventDefault()
    }
    setIsDragging(false)
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab'
      scrollRef.current.style.removeProperty('user-select')
    }
  }

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMoved) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={handleClickCapture}
        className={cn(
          "flex gap-6 overflow-x-auto px-6 lg:px-8 pb-8 cursor-grab scrollbar-hide select-none transition-all active:cursor-grabbing",
          !isDragging && "snap-x snap-proximity"
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: isDragging ? 'none' : ''
        }}
      >
        {/* Alignment Padding: Using max() to prevent negative widths on small screens */}
        <div
          className="flex-shrink-0 max-lg:hidden"
          style={{ width: `calc(max(0px, (100vw - 80rem) / 2))` }}
        />

        {products.map((product, index) => {
          return (
            <div
              key={product.id}
              className={cn(
                "flex-shrink-0 w-[240px] sm:w-[280px] md:w-[320px] snap-start invisible-before-reveal transition-transform duration-300",
                isIntersecting && "reveal-slide-up",
                isDragging && "pointer-events-none"
              )}
              style={{ animationDelay: isIntersecting ? `${index * 80}ms` : '0ms' }}
            >
              <ProductCard
                id={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                oldPrice={product.old_price}
                img={product.image_url}
                images={product.images}
                category={product.category}
              />
            </div>
          )
        })}

        {/* View all card */}
        <Link
          href="/products"
          className={cn(
            "group flex-shrink-0 w-[240px] sm:w-[280px] md:w-[320px] snap-start invisible-before-reveal",
            isIntersecting && "reveal-slide-up",
            isDragging && "pointer-events-none"
          )}
          style={{ animationDelay: isIntersecting ? `${products.length * 80}ms` : '0ms' }}
        >
          <div className="aspect-[3/4] border border-[#E8E4DF] flex flex-col items-center justify-center gap-6 hover:border-[#1A1A1A] hover:bg-[#FEFDFB] transition-all duration-500 rounded-sm">
            <div className="w-12 h-12 border border-[#1A1A1A]/20 flex items-center justify-center group-hover:border-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-all duration-500 rounded-full">
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

        {/* Right Alignment Padding: Using a standard flex approach instead of negative margin hacks */}
        <div
          className="flex-shrink-0"
          style={{ width: `calc(max(1.5rem, (100vw - 80rem) / 2))` }}
        />
      </div>
    </section>
  )
})

export default TrendingNow
