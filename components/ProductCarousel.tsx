import { useState, useRef, useCallback, memo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductCarouselProps {
  images: string[]
  productName: string
  saleBadge?: string
}

// Memoized to prevent re-renders
const ProductCarousel = memo(function ProductCarousel({ images, productName, saleBadge }: ProductCarouselProps) {
  const [selected, setSelected] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const hasMultiple = images.length > 1

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const scrollPosition = scrollRef.current.scrollLeft
    const width = scrollRef.current.clientWidth
    // Calculate which slide is currently in view
    const newSelected = Math.round(scrollPosition / width)
    if (newSelected !== selected && newSelected >= 0 && newSelected < images.length) {
      setSelected(newSelected)
    }
  }, [images.length, selected])

  const scrollToImage = useCallback((idx: number) => {
    if (!scrollRef.current) return
    const width = scrollRef.current.clientWidth
    scrollRef.current.scrollTo({
      left: width * idx,
      behavior: 'smooth'
    })
    setSelected(idx)
  }, [])

  return (
    <div className="space-y-4 w-full">
      {/* Native Scroll Carousel Container */}
      <div className="relative w-full rounded-none md:rounded-lg overflow-hidden bg-[#F8F7F5]">
        {/* Sale Badge */}
        {saleBadge && (
          <div className="absolute top-4 left-4 bg-[#1A1A1A] text-white text-[10px] font-medium uppercase tracking-[0.15em] px-3 py-1.5 z-20 shadow-sm">
            {saleBadge}
          </div>
        )}

        {/* Scroll Track */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Hide webkit scrollbar via inline styles injection for full cross-browser support */}
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {images.length > 0 ? (
            images.map((src, idx) => (
              <div 
                key={idx}
                className="relative flex-none w-full snap-center"
                style={{ aspectRatio: '3 / 4' }} // Portrait aspect ratio (3:4 is standard for fashion/jewelry)
              >
                <Image
                  src={src}
                  alt={`${productName} - View ${idx + 1}`}
                  fill
                  className="object-cover object-center w-full h-full"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={idx === 0}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjhGN0Y1Ii8+PC9zdmc+"
                />
              </div>
            ))
          ) : (
            <div className="relative flex-none w-full flex items-center justify-center text-[#9CA3AF] snap-center" style={{ aspectRatio: '3 / 4' }}>
              No image
            </div>
          )}
        </div>

        {/* Progress Dots overlaid on image */}
        {hasMultiple && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToImage(idx)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  idx === selected 
                    ? "bg-[#1A1A1A] scale-125 w-3" // Active dot gets wider like a capsule
                    : "bg-black/30 hover:bg-black/50"
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails (optional but good for desktop/tablet) */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-2 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToImage(idx)}
              className={cn(
                "flex-none relative w-[72px] h-[96px] rounded bg-[#F8F7F5] overflow-hidden transition-all duration-300",
                idx === selected 
                  ? "ring-1 ring-[#1A1A1A] ring-offset-2 opacity-100" 
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Image 
                src={src} 
                alt={`Thumbnail ${idx + 1}`} 
                fill 
                className="object-cover" 
                sizes="72px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

export default ProductCarousel
