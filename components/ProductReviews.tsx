import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ProductReview, ProductReviewStats } from '@/lib/supabase'

interface ProductReviewsProps {
  productId: string
}

const StarIcon = ({ filled, size = 20 }: { filled: boolean; size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={filled ? 'currentColor' : 'none'} 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [stats, setStats] = useState<ProductReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (productId) {
      fetchReviews()
    }
  }, [productId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?product_id=${productId}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number, size = 16) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
              className={star <= rating ? 'text-[#FDB022]' : 'text-[#E5E7EB]'}
          >
            <StarIcon filled={star <= rating} size={size} />
          </span>
        ))}
      </div>
    )
  }

  const getRatingPercentage = (count: number) => {
    if (!stats || stats.review_count === 0) return 0
    return Math.round((count / stats.review_count) * 100)
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#FDB022] border-t-transparent"></div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-t border-[#E5E7EB] mt-16 pt-12"
      >
        <h2 className="text-2xl md:text-3xl font-medium font-display text-[#1A1A1A] mb-6">Customer Reviews</h2>
        <div className="text-center py-12 bg-[#F8F7F5] rounded-lg font-poppins">
          <div className="text-[#1A1A1A] mb-2 font-semibold">No reviews yet</div>
          <p className="text-sm text-[#4B5563] font-normal">
            Be the first to review this product after your purchase
          </p>
        </div>
      </motion.div>
    )
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-t border-[#E5E7EB] mt-16 pt-12"
    >
      <h2 className="text-2xl md:text-3xl font-medium font-display text-[#1A1A1A] mb-8">Customer Reviews</h2>

      {/* Stats Summary */}
      {stats && stats.review_count > 0 && (
        <div className="flex flex-col md:flex-row gap-8 mb-10 pb-10 border-b border-[#E5E7EB] font-poppins">
          {/* Average Rating */}
          <div className="text-center md:text-left md:pr-8 md:border-r md:border-[#E5E7EB]">
            <div className="text-5xl font-medium text-[#1A1A1A] mb-2">
              {stats.average_rating}
            </div>
            <div className="mb-2">{renderStars(Math.round(stats.average_rating), 20)}</div>
            <div className="text-sm text-[#4B5563] font-normal">
              Based on {stats.review_count} review{stats.review_count !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats[`${['one', 'two', 'three', 'four', 'five'][rating - 1]}_star` as keyof ProductReviewStats] as number
              const percentage = getRatingPercentage(count)
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-[#4B5563] w-12 font-normal">{rating} star</span>
                  <div className="flex-1 h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#FDB022] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-[#4B5563] w-10 text-right font-normal">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6 font-poppins">
        {displayedReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="pb-6 border-b border-[#F3F4F6] last:border-0"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  {renderStars(review.rating)}
                  {review.is_verified_purchase && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-[#FDB022]/10 text-[#FDB022] rounded-full font-bold">
                      Verified Purchase
                    </span>
                  )}
                </div>
                {review.title && (
                  <h4 className="font-bold text-[#1A1A1A]">{review.title}</h4>
                )}
              </div>
              <span className="text-xs text-[#6B7280] font-normal">
                {formatDate(review.created_at)}
              </span>
            </div>
            <p className="text-[#374151] text-base leading-relaxed mb-2 font-normal">
              {review.comment}
            </p>
            <p className="text-xs text-[#1A1A1A] font-semibold">
              — {review.user_name}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Show More Button */}
      {reviews.length > 3 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-8 py-3 border border-[#E5E7EB] text-[#111827] hover:border-[#7A4A2B] hover:text-[#7A4A2B] transition-all duration-300 text-xs uppercase tracking-widest font-bold font-poppins rounded-full"
          >
            {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
          </button>
        </div>
      )}
    </motion.div>
  )
}
