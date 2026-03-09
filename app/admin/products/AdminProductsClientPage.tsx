'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import SortableImageGrid from '@/components/admin/SortableImageGrid'
import { useAdminApi } from '@/hooks/useAdminApi'
import { useDebounce } from '@/hooks/useDebounce'
import { useDirectUpload, UploadItem } from '@/hooks/useDirectUpload'
import { Product, Category } from '@/lib/supabase'
import { Collection } from '@/app/admin/collections/AdminCollectionsClientPage'

// Icons
const Icons = {
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  upload: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  grip: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="5" r="1" fill="currentColor" /><circle cx="15" cy="5" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" /><circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="19" r="1" fill="currentColor" /><circle cx="15" cy="19" r="1" fill="currentColor" />
    </svg>
  ),
  image: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  alertCircle: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function ProductsContent() {
  const api = useAdminApi()
  const toast = useToast()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const pendingUpdatesRef = useRef<Map<string, number>>(new Map())

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    old_price: '',
    category: '',
    gender: 'unisex',
    image_url: '',
    images: [] as string[],
    stock: '0',
    is_hidden: false,
    is_featured: false,
    collection_ids: [] as string[]
  })

  // Direct upload hook (bypasses API body limit -- uploads straight to Supabase)
  const {
    uploads,
    addFiles,
    uploadAll,
    removeUpload,
    reset: resetUploads,
    isUploading,
    pendingCount,
    totalProgress,
    MAX_FILE_SIZE
  } = useDirectUpload()

  // Drag-and-drop reorder state
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      openAddModal()
    }
  }, [searchParams])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsData, categoriesData, collectionsData] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<Category[]>('/categories'),
        api.get<Collection[]>('/collections')
      ])
      setProducts(productsData)
      setCategories(categoriesData)
      setCollections(collectionsData)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setForm({
      name: '',
      description: '',
      price: '',
      old_price: '',
      category: '',
      gender: 'unisex',
      image_url: '',
      images: [],
      stock: '0',
      is_hidden: false,
      is_featured: false,
      collection_ids: []
    })
    resetUploads()
    setView('form')
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    const existingImages = product.images || (product.image_url ? [product.image_url] : [])
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      old_price: product.old_price ? String(product.old_price) : '',
      category: product.category,
      gender: product.gender,
      image_url: product.image_url,
      images: existingImages,
      stock: String(product.stock),
      is_hidden: (product as Product & { is_hidden?: boolean }).is_hidden || false,
      is_featured: (product as any).is_featured || false,
      collection_ids: (product as any).collection_ids || []
    })
    resetUploads()
    setView('form')
  }

  /** Handle file input change -- validate and queue */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const maxTotal = 10 - form.images.length
    const errors = addFiles(files, maxTotal)
    errors.forEach(err => toast.error(err))
    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /** Upload all pending files directly to Supabase, then merge URLs into form */
  const handleUploadAll = async () => {
    const urls = await uploadAll()
    if (urls.length > 0) {
      const allImages = [...form.images, ...urls]
      setForm(f => ({
        ...f,
        images: allImages,
        image_url: allImages[0] || ''
      }))
      toast.success(`${urls.length} image(s) uploaded`)
    }
  }

  /** Remove an already-uploaded image from the form */
  const removeExistingImage = (index: number) => {
    setForm(f => {
      const images = f.images.filter((_, i) => i !== index)
      return { ...f, images, image_url: images[0] || '' }
    })
  }

  /** DnD Kit reorder handler -- replaces native HTML drag-and-drop */
  const handleImageReorder = (newImages: string[]) => {
    setForm(f => ({ ...f, images: newImages, image_url: newImages[0] || '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.images.length && !form.image_url) {
      toast.error('Please upload at least one image')
      return
    }

    if (submitting) return
    setSubmitting(true)

    const data = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      category: form.category,
      gender: form.gender,
      image_url: form.images[0] || form.image_url,
      images: form.images,
      stock: Number(form.stock),
      is_hidden: form.is_hidden,
      is_featured: form.is_featured,
      collection_ids: form.collection_ids
    }

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data)
        toast.success('Product updated successfully')
      } else {
        await api.post('/products', data)
        toast.success('Product created successfully')
      }
      setView('list')
      loadData()
    } catch (err: any) {
      console.error('Save product error:', err)
      const errorMsg = err?.error || err?.message || 'Failed to save product'
      toast.error(`Failed to save product: ${errorMsg}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (deleting) return
    setDeleting(true)
    try {
      await api.del(`/products/${id}`)
      toast.success('Product deleted successfully')
      setDeleteConfirm(null)
      loadData()
    } catch {
      toast.error('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  const performStockUpdate = async (id: string, newStock: number) => {
    try {
      await api.put(`/products/${id}`, { stock: newStock })
      toast.success('Stock updated')
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p))
      pendingUpdatesRef.current.delete(id)
    } catch (error) {
      console.error('Failed to update stock:', error)
      toast.error('Failed to update stock')
    }
  }

  const { debounced: debouncedStockUpdate } = useDebounce(
    performStockUpdate,
    300 // 300ms debounce delay for stock updates
  )

  const updateStock = (id: string, delta: number) => {
    const product = products.find(p => p.id === id)
    if (!product) return

    // Get the current pending value or the product's current stock
    const currentPending = pendingUpdatesRef.current.get(id)
    const currentStock = currentPending !== undefined ? currentPending : product.stock
    const newStock = Math.max(0, currentStock + delta)

    // Store pending update
    pendingUpdatesRef.current.set(id, newStock)

    // Update UI immediately for responsiveness
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p))

    // Debounce the actual API call
    debouncedStockUpdate(id, newStock)
  }

  const toggleHidden = async (id: string, hidden: boolean) => {
    try {
      await api.put(`/products/${id}`, { is_hidden: !hidden })
      toast.success(hidden ? 'Product is now visible' : 'Product is now hidden')
      loadData()
    } catch {
      toast.error('Failed to update product')
    }
  }

  const filteredProducts = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCategory && p.category !== filterCategory) return false
    if (filterGender && p.gender !== filterGender) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[#666]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Loading products...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {view === 'list' ? (
        <>
          {/* Page header + Toolbar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div>
                <p className="text-[#666] text-sm">{filteredProducts.length} of {products.length} products</p>
              </div>
              <button
                onClick={openAddModal}
                className="admin-btn admin-btn-primary text-sm"
              >
                {Icons.plus}
                <span>Add Product</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">{Icons.search}</span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="admin-input pl-10 w-full"
                />
              </div>
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="admin-input pr-8 appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none">
                  {Icons.chevronDown}
                </span>
              </div>
              <div className="relative">
                <select
                  value={filterGender}
                  onChange={e => setFilterGender(e.target.value)}
                  className="admin-input pr-8 appearance-none cursor-pointer min-w-[120px]"
                >
                  <option value="">All Genders</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none">
                  {Icons.chevronDown}
                </span>
              </div>
            </div>
          </div>

          {/* Products -- Card Grid for mobile, Table for desktop */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="hidden sm:table-cell">Category</th>
                    <th>Price</th>
                    <th className="hidden md:table-cell">Stock</th>
                    <th className="hidden sm:table-cell">Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const isHidden = (product as Product & { is_hidden?: boolean }).is_hidden
                    return (
                      <tr key={product.id} className={`${isHidden ? 'opacity-50' : ''} group`}>
                        <td>
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[#111] border border-[#222] flex-shrink-0">
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm truncate">{product.name}</p>
                              <p className="text-[#555] text-xs capitalize mt-0.5">{product.gender}</p>
                              <p className="text-[#555] text-xs capitalize sm:hidden mt-0.5">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell">
                          <span className="text-[#888] text-sm capitalize">{product.category}</span>
                        </td>
                        <td>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                            <span className="text-white text-sm font-medium">₨{product.price.toLocaleString()}</span>
                            {product.old_price && (
                              <span className="text-[#555] line-through text-xs">₨{product.old_price.toLocaleString()}</span>
                            )}
                          </div>
                        </td>
                        <td className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateStock(product.id, -1)}
                              className="w-8 h-8 rounded-lg bg-[#111] hover:bg-[#1a1a1a] text-[#888] hover:text-white text-sm transition-all active:scale-90 border border-[#222]"
                            >
                              −
                            </button>
                            <span className={`w-8 text-center text-sm font-medium ${product.stock === 0 ? 'text-[#ff6166]' :
                              product.stock <= 5 ? 'text-[#f5a623]' : 'text-white'
                              }`}>
                              {product.stock}
                            </span>
                            <button
                              onClick={() => updateStock(product.id, 1)}
                              className="w-8 h-8 rounded-lg bg-[#111] hover:bg-[#1a1a1a] text-[#888] hover:text-white text-sm transition-all active:scale-90 border border-[#222]"
                            >
                              +
                            </button>
                            <button
                              onClick={() => updateStock(product.id, 10)}
                              className="ml-1 px-2.5 py-1 rounded-lg bg-[#111] hover:bg-[#1a1a1a] text-[#555] hover:text-white text-xs transition-all active:scale-90 border border-[#222]"
                            >
                              +10
                            </button>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell">
                          <button
                            onClick={() => toggleHidden(product.id, isHidden || false)}
                            className={`admin-badge cursor-pointer transition-all active:scale-95 ${isHidden ? 'admin-badge-error' : 'admin-badge-success'}`}
                          >
                            {isHidden ? 'Hidden' : 'Visible'}
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(product)}
                              className="px-3 py-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#1a1a1a] text-sm transition-all active:scale-95"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(product.id)}
                              className="px-3 py-1.5 rounded-lg text-[#666] hover:text-[#ff6166] hover:bg-[#ff6166]/10 text-sm transition-all active:scale-95"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#111] flex items-center justify-center mx-auto mb-4 text-[#333]">
                  {Icons.search}
                </div>
                <p className="text-[#666] mb-1">No products found</p>
                <p className="text-[#444] text-xs">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* ===== Inline Add/Edit Form ===== */}
          <div className="space-y-6">
            {/* Back button + heading */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('list')}
                className="w-10 h-10 rounded-xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-all active:scale-95"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div>
                <h2 className="text-white text-lg sm:text-xl font-semibold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-[#555] text-sm mt-0.5">
                  {editingProduct ? 'Update product details and images' : 'Fill in the details for your new product'}
                </p>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
              <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6">
                {/* Name + Stock row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="admin-input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      className="admin-input w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="admin-input w-full h-24 resize-none"
                    required
                  />
                </div>

                {/* Price row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="admin-input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Old Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.old_price}
                      onChange={e => setForm(f => ({ ...f, old_price: e.target.value }))}
                      className="admin-input w-full"
                      placeholder="For discounts"
                    />
                  </div>
                </div>

                {/* Category + Gender row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Category</label>
                    <div className="relative">
                      <select
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="admin-input w-full pr-8 appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none">
                        {Icons.chevronDown}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Gender</label>
                    <div className="relative">
                      <select
                        value={form.gender}
                        onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                        className="admin-input w-full pr-8 appearance-none cursor-pointer"
                        required
                      >
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="unisex">Unisex</option>
                      </select>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none">
                        {Icons.chevronDown}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exclusive Collections row */}
                {collections.length > 0 && (
                  <div className="pt-2">
                    <label className="block text-[#a1a1a1] text-[13px] font-medium mb-3">Assign to Exclusive Collections</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {collections.map(c => (
                        <label key={c.id} className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-[#1a1a1a] bg-[#111] hover:bg-[#1a1a1a] transition-colors">
                          <input
                            type="checkbox"
                            checked={form.collection_ids.includes(c.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm(f => ({ ...f, collection_ids: [...f.collection_ids, c.id] }))
                              } else {
                                setForm(f => ({ ...f, collection_ids: f.collection_ids.filter(id => id !== c.id) }))
                              }
                            }}
                            className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a] text-[#C9A96E] focus:ring-0 focus:ring-offset-0"
                          />
                          <div className="flex flex-col">
                            <span className="text-[#eee] text-sm leading-tight">{c.name}</span>
                            {!c.is_active && <span className="text-[#888] text-[10px]">Draft</span>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== IMAGE SECTION -- DnD Kit Powered ===== */}
                <div>
                  <label className="block text-[#a1a1a1] text-[13px] font-medium mb-3">
                    Product Images
                    <span className="text-[#555] ml-2">
                      ({form.images.length + uploads.length}/10 · max 8 MB each)
                    </span>
                  </label>

                  {/* DnD Kit Sortable Image Grid */}
                  {form.images.length > 0 && (
                    <div className="mb-4">
                      <SortableImageGrid
                        images={form.images}
                        onReorder={handleImageReorder}
                        onRemove={removeExistingImage}
                      />
                    </div>
                  )}

                  {/* Pending uploads with progress bars */}
                  {uploads.length > 0 && (
                    <div className="mb-4 space-y-3">
                      <p className="text-[11px] uppercase tracking-wider text-[#555] font-medium">
                        {isUploading ? `Uploading... ${totalProgress}%` : `${pendingCount} file(s) ready to upload`}
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                        {uploads.map((item) => (
                          <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden bg-[#111] border-2 border-[#1a1a1a] group">
                            {/* Preview */}
                            <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover" />

                            {/* Progress overlay */}
                            {item.status === 'uploading' && (
                              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                <span className="text-white text-xs font-medium mb-1">{item.progress}%</span>
                                <div className="w-3/4 h-1 bg-[#333] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-[#0070f3] rounded-full transition-all duration-200"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Done overlay */}
                            {item.status === 'done' && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-[#50e3c2] flex items-center justify-center text-black">
                                  {Icons.check}
                                </div>
                              </div>
                            )}

                            {/* Error overlay */}
                            {item.status === 'error' && (
                              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-1">
                                <div className="text-[#ff6166] mb-1">{Icons.alertCircle}</div>
                                <span className="text-[#ff6166] text-[9px] text-center leading-tight">{item.error || 'Failed'}</span>
                              </div>
                            )}

                            {/* Remove button -- always visible on mobile */}
                            {item.status !== 'uploading' && (
                              <button
                                type="button"
                                onClick={() => removeUpload(item.id)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-[#ff6166] hover:bg-[#ff7a7e] rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-lg"
                              >
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Upload button */}
                      {pendingCount > 0 && (
                        <button
                          type="button"
                          onClick={handleUploadAll}
                          disabled={isUploading}
                          className="admin-btn admin-btn-primary w-full disabled:opacity-50 mt-2"
                        >
                          {isUploading ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Uploading {totalProgress}%
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              {Icons.upload}
                              Upload {pendingCount} Image{pendingCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* File picker -- drop zone */}
                  {(form.images.length + uploads.length) < 10 && (
                    <label
                      className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#2a2a2a] hover:border-[#444] rounded-2xl py-10 sm:py-12 cursor-pointer transition-all group hover:bg-[#0a0a0a]"
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#0070f3]') }}
                      onDragLeave={(e) => { e.currentTarget.classList.remove('border-[#0070f3]') }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove('border-[#0070f3]')
                        const files = Array.from(e.dataTransfer.files)
                        const maxTotal = 10 - form.images.length
                        const errors = addFiles(files, maxTotal)
                        errors.forEach(err => toast.error(err))
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="text-[#555] group-hover:text-[#888] transition-colors">
                        {Icons.image}
                      </div>
                      <div className="text-center">
                        <p className="text-[#888] text-sm">
                          Drop images here or <span className="text-[#0070f3]">browse</span>
                        </p>
                        <p className="text-[#555] text-xs mt-1">
                          JPEG, PNG, WebP, AVIF · Max 8 MB each
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                    className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a] text-[#C9A96E] focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-[#888] text-sm">â­ Feature this product (Most Loved section)</span>
                </label>

                {editingProduct && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_hidden}
                      onChange={e => setForm(f => ({ ...f, is_hidden: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a] text-white focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-[#888] text-sm">Hide product from store</span>
                  </label>
                )}

                {/* Form actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-[#1a1a1a]">
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="admin-btn admin-btn-secondary py-3 px-6"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || submitting}
                    className="admin-btn admin-btn-primary py-3 px-6 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {submitting
                      ? (editingProduct ? 'Saving...' : 'Adding Product...')
                      : (editingProduct ? 'Save Changes' : 'Add Product')
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )
      }

      {/* Delete Confirmation */}
      {
        deleteConfirm && (
          <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-[#ff4444]/10 flex items-center justify-center mx-auto mb-4">
                {Icons.trash}
              </div>
              <h3 className="text-white text-base font-semibold mb-2 text-center">Delete Product</h3>
              <p className="text-[#777] text-sm mb-6 text-center">
                This action cannot be undone. The product will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 admin-btn admin-btn-secondary py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 admin-btn admin-btn-danger py-2.5"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}

export default function AdminProductsClientPage() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <AdminLayout title="Products">
          <ProductsContent />
        </AdminLayout>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
