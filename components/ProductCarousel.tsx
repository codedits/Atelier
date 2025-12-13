import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ProductCarouselProps {
  images: string[]
  productName: string
  saleBadge?: string
}

export default function ProductCarousel({ images, productName, saleBadge }: ProductCarouselProps) {
  const [selected, setSelected] = useState(0)

  // Reset to first image when images change
  useEffect(() => {
    setSelected(0)
  }, [images])

  // Prefetch images
  useEffect(() => {
    images.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [images])

  const hasMultiple = images.length > 1

  const goPrev = () => setSelected((i) => (i - 1 + images.length) % images.length)
  const goNext = () => setSelected((i) => (i + 1) % images.length)

  return (
    <div className="space-y-4">
      {/* Main Image - 4:5 aspect ratio */}
      <div
        className="relative w-full bg-[#F8F7F5] rounded-lg overflow-hidden"
        style={{ aspectRatio: '4 / 5' }}
      >
        {images[selected] ? (
          <Image
            key={selected}
            src={images[selected]}
            alt={`${productName} - Image ${selected + 1}`}
            fill
            className="object-cover object-center w-full h-full"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={selected === 0}
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

        {/* Arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md z-10"
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md z-10"
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
                  onClick={() => setSelected(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
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
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelected(idx)}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-all ${
                idx === selected
                  ? 'border-[#D4A5A5] ring-2 ring-[#D4A5A5]/30'
                  : 'border-transparent hover:border-[#D4A5A5]/50'
              }`}
            >
              <div className="relative w-full h-full bg-[#F8F7F5]">
                <Image src={src} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="80px" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
