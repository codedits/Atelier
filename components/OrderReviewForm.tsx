import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface OrderItem {
  product_id?: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface ReviewFormProps {
  orderId: string
  items: OrderItem[]
  userEmail?: string
  userName?: string
}

const StarIcon = ({ filled, onClick, onHover, size = 28 }: { 
  filled: boolean
  onClick?: () => void
  onHover?: () => void
  size?: number 
}) => (
  <button
    type="button"
    onClick={onClick}
    onMouseEnter={onHover}
    className={`transition-colors ${filled ? 'text-[#FDB022]' : 'text-gray-300 hover:text-[#FDB022]/50'}`}
  >
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
  </button>
)

interface ProductReviewState {
  rating: number
  hoverRating: number
  title: string
  comment: string
  submitted: boolean
  submitting: boolean
  error: string | null
}

export default function OrderReviewForm({ orderId, items, userEmail, userName }: ReviewFormProps) {
  const [reviews, setReviews] = useState<Record<string, ProductReviewState>>(
    items.reduce((acc, item) => {
      if (item.product_id) {
        acc[item.product_id] = {
          rating: 0,
          hoverRating: 0,
          title: '',
          comment: '',
          submitted: false,
          submitting: false,
          error: null
        }
      }
      return acc
    }, {} as Record<string, ProductReviewState>)
  )

  const [expanded, setExpanded] = useState<string | null>(null)

  const updateReview = (productId: string, updates: Partial<ProductReviewState>) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], ...updates }
    }))
  }

  const handleSubmitReview = async (productId: string) => {
    const review = reviews[productId]
    
    if (review.rating === 0) {
      updateReview(productId, { error: 'Please select a rating' })
      return
    }
    
    if (!review.comment.trim()) {
      updateReview(productId, { error: 'Please write a review' })
      return
    }

    updateReview(productId, { submitting: true, error: null })

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          product_id: productId,
          order_id: orderId,
          rating: review.rating,
          title: review.title.trim() || undefined,
          comment: review.comment.trim(),
          user_name: userName,
          user_email: userEmail
        })
      })

      if (!response.ok) {
        const data = await response.json()
        updateReview(productId, { 
          error: data.error || 'Failed to submit review', 
          submitting: false 
        })
        return
      }

      updateReview(productId, { submitted: true, submitting: false })
    } catch (err) {
      console.error('Failed to submit review:', err)
      updateReview(productId, { 
        error: 'Network error. Please try again.', 
        submitting: false 
      })
    }
  }

  const itemsWithProductId = items.filter(item => item.product_id)
  
  if (itemsWithProductId.length === 0) {
    return null
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#FDB022]/10 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-[#FDB022]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900">Review Your Purchase</h2>
          <p className="text-sm text-gray-500">Share your experience with these products</p>
        </div>
      </div>

      <div className="space-y-4">
        {itemsWithProductId.map((item) => {
          const review = reviews[item.product_id!]
          const isExpanded = expanded === item.product_id

          if (review.submitted) {
            return (
              <div 
                key={item.product_id}
                className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-xl"
              >
                <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-400">No img</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Review submitted successfully
                  </p>
                </div>
              </div>
            )
          }

          return (
            <div 
              key={item.product_id}
              className="border border-gray-100 rounded-xl overflow-hidden transition-all"
            >
              {/* Product Header - Always visible */}
              <button
                onClick={() => setExpanded(isExpanded ? null : item.product_id!)}
                className="w-full flex items-center gap-4 p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="relative w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-400">No img</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Click to write a review</p>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Review Form - Expandable */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-100 bg-white">
                  {/* Star Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Rating *
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <StarIcon
                          key={star}
                          filled={star <= (review.hoverRating || review.rating)}
                          onClick={() => updateReview(item.product_id!, { rating: star, error: null })}
                          onHover={() => updateReview(item.product_id!, { hoverRating: star })}
                        />
                      ))}
                    </div>
                    <div 
                      className="mt-1"
                      onMouseLeave={() => updateReview(item.product_id!, { hoverRating: 0 })}
                    />
                  </div>

                  {/* Review Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={review.title}
                      onChange={(e) => updateReview(item.product_id!, { title: e.target.value })}
                      placeholder="Summarize your experience"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB022]/30 focus:border-[#FDB022]"
                      maxLength={100}
                    />
                  </div>

                  {/* Review Comment */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review *
                    </label>
                    <textarea
                      value={review.comment}
                      onChange={(e) => updateReview(item.product_id!, { comment: e.target.value, error: null })}
                      placeholder="Share your experience with this product..."
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FDB022]/30 focus:border-[#FDB022] resize-none"
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {review.comment.length}/1000
                    </p>
                  </div>

                  {/* Error Message */}
                  {review.error && (
                    <p className="text-sm text-red-600 mb-4">{review.error}</p>
                  )}

                  {/* Submit Button */}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/products/${item.product_id}`}
                      className="text-xs text-[#FDB022] hover:underline"
                    >
                      View Product →
                    </Link>
                    <button
                      onClick={() => handleSubmitReview(item.product_id!)}
                      disabled={review.submitting}
                      className="px-4 py-2 bg-[#FDB022] text-white text-sm font-medium rounded-lg hover:bg-[#F59E0B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {review.submitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        'Submit Review'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
