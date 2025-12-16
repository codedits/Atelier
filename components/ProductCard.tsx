import Image from 'next/image'
import Link from 'next/link'
import { memo } from 'react'

type Props = {
  id?: string
  name: string
  price: string | number
  img: string
  category?: string
  oldPrice?: number
}

// Memoized component to prevent unnecessary re-renders
const ProductCard = memo(function ProductCard({ id, name, price, img, category = 'Fine Jewellery', oldPrice }: Props) {
  const formattedPrice = typeof price === 'number' ? `₨${price.toLocaleString()}` : price
  const productUrl = id ? `/products/${id}` : '/products'

  return (
    <article className="group cursor-pointer contain-layout hover-lift">
      <Link href={productUrl} className="block" prefetch={false}>
        <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-[#f0e3ce] rounded-lg transition-shadow duration-200 group-hover:shadow-lg">
          {/* Use CSS transform instead of framer-motion for better perf */}
          <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.03] gpu-accelerated">
            <Image 
              src={img} 
              alt={name} 
              fill 
              className="object-cover" 
              sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjhGN0Y1Ii8+PC9zdmc+"
            />
          </div>

          {/* Sale badge */}
          {oldPrice && (
            <div className="absolute top-3 left-3 bg-[#D4A5A5] text-white text-xs font-medium px-2 py-1 rounded">
              Sale
            </div>
          )}

          {/* Quick view button on hover - simplified animation */}
          <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-0">
            <span className="block w-full text-sm font-medium text-[#1A1A1A] text-center flex items-center justify-center gap-2">
              View Details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
        
        <div className="space-y-1 text-center px-2">
          <p className="text-xs text-[#6B6B6B] uppercase tracking-wide">{category}</p>
          <h3 className="font-normal text-base text-[#1A1A1A] group-hover:text-[#D4A5A5] transition-colors duration-150">{name}</h3>
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-[#1A1A1A] font-medium">{formattedPrice}</p>
            {oldPrice && (
              <p className="text-sm text-[#9CA3AF] line-through">₨{oldPrice.toLocaleString()}</p>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
})

export default ProductCard
