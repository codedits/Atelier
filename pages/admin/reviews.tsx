import { useEffect, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'

// Icons
const Icons = {
  star: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  starEmpty: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  trash: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  x: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

interface Review {
  id: string
  product_id: string
  order_id: string
  user_name: string
  user_email?: string
  rating: number
  title?: string
  comment: string
  is_verified_purchase: boolean
  is_approved: boolean
  created_at: string
  products?: {
    name: string
    image_url: string
  }
}

function ReviewsContent() {
  const api = useAdminApi()
  const toast = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterApproved, setFilterApproved] = useState<string>('')
  const [filterRating, setFilterRating] = useState<string>('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const data = await api.get<{ reviews: Review[], total: number }>('/reviews')
      setReviews(data.reviews)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/reviews/${id}`, { is_approved: !currentStatus })
      toast.success(currentStatus ? 'Review unapproved' : 'Review approved')
      setReviews(prev => prev.map(r => 
        r.id === id ? { ...r, is_approved: !currentStatus } : r
      ))
    } catch {
      toast.error('Failed to update review status')
    }
  }

  const deleteReview = async (id: string) => {
    try {
      await api.del(`/reviews/${id}`)
      toast.success('Review deleted successfully')
      setReviews(prev => prev.filter(r => r.id !== id))
      setDeleteConfirm(null)
      if (selectedReview?.id === id) {
        setSelectedReview(null)
      }
    } catch {
      toast.error('Failed to delete review')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <span 
            key={star} 
            className={star <= rating ? 'text-[#f5a623]' : 'text-[#333]'}
          >
            {Icons.star}
          </span>
        ))}
      </div>
    )
  }

  const filteredReviews = reviews.filter(r => {
    if (search) {
      const searchLower = search.toLowerCase()
      if (!r.user_name.toLowerCase().includes(searchLower) &&
          !r.comment.toLowerCase().includes(searchLower) &&
          !(r.products?.name || '').toLowerCase().includes(searchLower)) {
        return false
      }
    }
    if (filterApproved && ((filterApproved === 'approved') !== r.is_approved)) return false
    if (filterRating && r.rating !== parseInt(filterRating)) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[#666]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span className="text-sm">Loading reviews...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">{Icons.search}</span>
          <input
            type="text"
            placeholder="Search by customer, product, or comment..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-input w-full pl-9"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={filterApproved}
              onChange={e => setFilterApproved(e.target.value)}
              className="admin-input pr-8 appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none">
              {Icons.chevronDown}
            </span>
          </div>
          <div className="relative">
            <select
              value={filterRating}
              onChange={e => setFilterRating(e.target.value)}
              className="admin-input pr-8 appearance-none cursor-pointer"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none">
              {Icons.chevronDown}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-[#666]">
          Total: <span className="text-white">{reviews.length}</span>
        </span>
        <span className="text-[#50e3c2]">
          Approved: {reviews.filter(r => r.is_approved).length}
        </span>
        <span className="text-[#f5a623]">
          Pending: {reviews.filter(r => !r.is_approved).length}
        </span>
        <span className="text-[#666]">
          Avg Rating: <span className="text-white">
            {reviews.length > 0 
              ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
              : '0.0'
            }
          </span>
        </span>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-[#666]">
            {search || filterApproved || filterRating
              ? 'No reviews match your filters'
              : 'No reviews yet'
            }
          </div>
        ) : (
          filteredReviews.map(review => (
            <div
              key={review.id}
              className={`bg-[#0a0a0a] border rounded-xl p-4 transition-colors ${
                review.is_approved ? 'border-[#262626]' : 'border-[#f5a623]/30'
              }`}
            >
              <div className="flex gap-4">
                {/* Product Image */}
                {review.products?.image_url && (
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden bg-[#111] flex-shrink-0">
                    <Image
                      src={review.products.image_url}
                      alt={review.products.name || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(review.rating)}
                        {!review.is_approved && (
                          <span className="text-xs px-2 py-0.5 bg-[#f5a623]/10 text-[#f5a623] rounded">
                            Pending
                          </span>
                        )}
                        {review.is_verified_purchase && (
                          <span className="text-xs px-2 py-0.5 bg-[#50e3c2]/10 text-[#50e3c2] rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-white font-medium text-sm">
                        {review.user_name}
                        <span className="text-[#666] font-normal ml-2">
                          on {review.products?.name || 'Unknown Product'}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-[#666] whitespace-nowrap">
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  {review.title && (
                    <p className="text-white font-medium text-sm mb-1">{review.title}</p>
                  )}
                  <p className="text-[#999] text-sm line-clamp-2">{review.comment}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => toggleApproval(review.id, review.is_approved)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        review.is_approved
                          ? 'bg-[#f5a623]/10 text-[#f5a623] hover:bg-[#f5a623]/20'
                          : 'bg-[#50e3c2]/10 text-[#50e3c2] hover:bg-[#50e3c2]/20'
                      }`}
                    >
                      {review.is_approved ? Icons.x : Icons.check}
                      {review.is_approved ? 'Disapprove' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="px-3 py-1.5 bg-[#1a1a1a] text-[#888] hover:text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(review.id)}
                      className="p-1.5 text-[#666] hover:text-[#ff6166] hover:bg-[#ff616610] rounded-lg transition-colors"
                      title="Delete"
                    >
                      {Icons.trash}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-md w-full p-6">
            <h3 className="text-white font-medium mb-2">Delete Review</h3>
            <p className="text-[#888] text-sm mb-4">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-[#888] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteReview(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#262626] p-4 flex items-center justify-between">
              <h3 className="text-white font-medium">Review Details</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-2 text-[#666] hover:text-white transition-colors"
              >
                {Icons.x}
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Product */}
              {selectedReview.products && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-[#111]">
                    <Image
                      src={selectedReview.products.image_url}
                      alt={selectedReview.products.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{selectedReview.products.name}</p>
                    <p className="text-[#666] text-xs">Product</p>
                  </div>
                </div>
              )}

              {/* Rating */}
              <div>
                <p className="text-[#666] text-xs mb-1">Rating</p>
                {renderStars(selectedReview.rating)}
              </div>

              {/* Customer */}
              <div>
                <p className="text-[#666] text-xs mb-1">Customer</p>
                <p className="text-white text-sm">{selectedReview.user_name}</p>
                {selectedReview.user_email && (
                  <p className="text-[#888] text-xs">{selectedReview.user_email}</p>
                )}
              </div>

              {/* Title */}
              {selectedReview.title && (
                <div>
                  <p className="text-[#666] text-xs mb-1">Title</p>
                  <p className="text-white text-sm">{selectedReview.title}</p>
                </div>
              )}

              {/* Comment */}
              <div>
                <p className="text-[#666] text-xs mb-1">Comment</p>
                <p className="text-[#ccc] text-sm whitespace-pre-wrap">{selectedReview.comment}</p>
              </div>

              {/* Meta */}
              <div className="flex gap-4 text-xs text-[#666]">
                <span>Order: {selectedReview.order_id.slice(0, 8)}...</span>
                <span>Date: {formatDate(selectedReview.created_at)}</span>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  selectedReview.is_approved 
                    ? 'bg-[#50e3c2]/10 text-[#50e3c2]' 
                    : 'bg-[#f5a623]/10 text-[#f5a623]'
                }`}>
                  {selectedReview.is_approved ? 'Approved' : 'Pending Approval'}
                </span>
                {selectedReview.is_verified_purchase && (
                  <span className="text-xs px-2 py-1 rounded bg-[#60a5fa]/10 text-[#60a5fa]">
                    Verified Purchase
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    toggleApproval(selectedReview.id, selectedReview.is_approved)
                    setSelectedReview({
                      ...selectedReview,
                      is_approved: !selectedReview.is_approved
                    })
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedReview.is_approved
                      ? 'bg-[#f5a623]/10 text-[#f5a623] hover:bg-[#f5a623]/20'
                      : 'bg-[#50e3c2]/10 text-[#50e3c2] hover:bg-[#50e3c2]/20'
                  }`}
                >
                  {selectedReview.is_approved ? 'Disapprove' : 'Approve'}
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirm(selectedReview.id)
                  }}
                  className="px-4 py-2 bg-red-600/10 text-red-400 hover:bg-red-600/20 rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminReviews() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <Head>
          <title>Reviews — Atelier Admin</title>
        </Head>
        <AdminLayout title="Reviews">
          <ReviewsContent />
        </AdminLayout>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
