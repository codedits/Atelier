import { useState, useEffect, useCallback, memo } from 'react'
import Image from 'next/image'

interface ProductCarouselProps {
  images: string[]
  productName: string
  saleBadge?: string
}

// Memoized to prevent re-renders
const ProductCarousel = memo(function ProductCarousel({ images, productName, saleBadge }: ProductCarouselProps) {
  const [selected, setSelected] = useState(0)

  // Reset to first image when images change
  useEffect(() => {
    setSelected(0)
  }, [images])

  const hasMultiple = images.length > 1

  // Memoized navigation handlers
  const goPrev = useCallback(() => {
    setSelected((i) => (i - 1 + images.length) % images.length)
  }, [images.length])
  
  const goNext = useCallback(() => {
    setSelected((i) => (i + 1) % images.length)
  }, [images.length])

  const selectImage = useCallback((idx: number) => {
    setSelected(idx)
  }, [])

  return (
    <div className="space-y-4 contain-layout">
      {/* Main Image - 4:5 aspect ratio */}
      <div
        className="relative w-full bg-[#F8F7F5] rounded-lg overflow-hidden contain-paint"
        style={{ aspectRatio: '4 / 5' }}
      >
        {images[selected] ? (
          <Image
            key={selected}
            src={images[selected]}
            alt={`${productName} - Image ${selected + 1}`}
            fill
            className="object-cover object-center w-full h-full gpu-accelerated"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={selected === 0}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjhGN0Y1Ii8+PC9zdmc+"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#9CA3AF]">
            No image
          </div>
        )}

        {/* Sale Badge */}
        {saleBadge && (
          <div className="absolute top-4 left-4 bg-[#D4A5A5] text-white text-sm font-medium px-3 py-1.5 rounded z-10">
            {saleBadge}
          </div>
        )}

        {/* Arrows - simplified transitions */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md z-10 transition-colors duration-150"
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md z-10 transition-colors duration-150"
              aria-label="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectImage(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-150 ${
                    idx === selected ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectImage(idx)}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-all duration-150 ${
                idx === selected
                  ? 'border-[#D4A5A5] ring-2 ring-[#D4A5A5]/30'
                  : 'border-transparent hover:border-[#D4A5A5]/50'
              }`}
            >
              <div className="relative w-full h-full bg-[#F8F7F5]">
                <Image 
                  src={src} 
                  alt={`Thumbnail ${idx + 1}`} 
                  fill 
                  className="object-cover" 
                  sizes="80px"
                  loading="lazy"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

export default ProductCarousel
