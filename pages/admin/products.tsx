import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'
import { useDebounce } from '@/hooks/useDebounce'
import { Product, Category } from '@/lib/supabase'

// Icons
const Icons = {
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  upload: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  chevronDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function ProductsContent() {
  const api = useAdminApi()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterGender, setFilterGender] = useState('')
  const [showModal, setShowModal] = useState(false)
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
    is_hidden: false
  })
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (router.query.action === 'add') {
      openAddModal()
    }
  }, [router.query])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<Category[]>('/categories')
      ])
      setProducts(productsData)
      setCategories(categoriesData)
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
      is_hidden: false
    })
    setPreviewUrls([])
    setSelectedFiles([])
    setShowModal(true)
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
      is_hidden: (product as Product & { is_hidden?: boolean }).is_hidden || false
    })
    setPreviewUrls(existingImages)
    setSelectedFiles([])
    setShowModal(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const currentCount = previewUrls.length
    const remainingSlots = 10 - currentCount
    
    if (files.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more image(s). Maximum 10 images allowed.`)
      return
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Each file must be less than 10MB')
        return
      }
    }

    setSelectedFiles(prev => [...prev, ...files])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    setForm(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== index),
      image_url: index === 0 ? (f.images[1] || '') : f.image_url
    }))
    const uploadedCount = form.images.length
    if (index >= uploadedCount) {
      const fileIndex = index - uploadedCount
      setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex))
    }
  }

  const handleUploadImages = async () => {
    if (!selectedFiles.length) return

    setUploading(true)
    try {
      const uploadedUrls: string[] = []

      for (const file of selectedFiles) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        
        await new Promise<void>((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64 = (reader.result as string).split(',')[1]
              
              const response = await api.post<{ publicUrl: string }>('/upload', {
                filename: file.name,
                fileData: base64,
                contentType: file.type,
                folder: 'products'
              })

              if (response.publicUrl) {
                uploadedUrls.push(response.publicUrl)
              }
              resolve()
            } catch (error) {
              reject(error)
            }
          }
          reader.onerror = reject
        })
      }

      if (uploadedUrls.length > 0) {
        const allImages = [...form.images, ...uploadedUrls]
        setForm(f => ({
          ...f,
          images: allImages,
          image_url: allImages[0] || ''
        }))
        setSelectedFiles([])
        alert(`${uploadedUrls.length} image(s) uploaded successfully!`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload images. Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.images.length && !form.image_url) {
      alert('Please upload at least one image')
      return
    }

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
      is_hidden: form.is_hidden
    }

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, data)
      } else {
        await api.post('/products', data)
      }
      setShowModal(false)
      loadData()
    } catch (err: any) {
      console.error('Save product error:', err)
      const errorMsg = err?.error || err?.message || 'Failed to save product'
      alert(`Failed to save product: ${errorMsg}`)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.del(`/products/${id}`)
      setDeleteConfirm(null)
      loadData()
    } catch {
      alert('Failed to delete product')
    }
  }

  const performStockUpdate = async (id: string, newStock: number) => {
    try {
      await api.put(`/products/${id}`, { stock: newStock })
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p))
      pendingUpdatesRef.current.delete(id)
    } catch (error) {
      console.error('Failed to update stock:', error)
      alert('Failed to update stock')
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
      loadData()
    } catch {
      alert('Failed to update product')
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
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span className="text-sm">Loading products...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">{Icons.search}</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-input pl-9 w-full sm:w-[240px]"
            />
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="admin-input pr-8 appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none">
              {Icons.chevronDown}
            </span>
          </div>
          <div className="relative">
            <select
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              className="admin-input pr-8 appearance-none cursor-pointer"
            >
              <option value="">All Genders</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#666] pointer-events-none">
              {Icons.chevronDown}
            </span>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="admin-btn admin-btn-primary"
        >
          {Icons.plus}
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const isHidden = (product as Product & { is_hidden?: boolean }).is_hidden
                return (
                  <tr key={product.id} className={isHidden ? 'opacity-50' : ''}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#262626]">
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{product.name}</p>
                          <p className="text-[#666] text-xs capitalize">{product.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-[#888] text-sm capitalize">{product.category}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">₨{product.price}</span>
                        {product.old_price && (
                          <span className="text-[#666] line-through text-xs">₨{product.old_price}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStock(product.id, -1)}
                          className="w-6 h-6 rounded bg-[#1a1a1a] hover:bg-[#262626] text-[#888] hover:text-white text-sm transition-colors"
                        >
                          -
                        </button>
                        <span className={`w-6 text-center text-sm ${
                          product.stock === 0 ? 'text-[#ff6166]' :
                          product.stock <= 5 ? 'text-[#f5a623]' : 'text-white'
                        }`}>
                          {product.stock}
                        </span>
                        <button
                          onClick={() => updateStock(product.id, 1)}
                          className="w-6 h-6 rounded bg-[#1a1a1a] hover:bg-[#262626] text-[#888] hover:text-white text-sm transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => updateStock(product.id, 10)}
                          className="ml-1 px-2 py-0.5 rounded bg-[#1a1a1a] hover:bg-[#262626] text-[#666] hover:text-white text-xs transition-colors"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleHidden(product.id, isHidden || false)}
                        className={`admin-badge ${isHidden ? 'admin-badge-error' : 'admin-badge-success'}`}
                      >
                        {isHidden ? 'Hidden' : 'Visible'}
                      </button>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-[#888] hover:text-white text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <span className="text-[#333]">·</span>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="text-[#888] hover:text-[#ff6166] text-sm transition-colors"
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
          <div className="p-12 text-center text-[#666]">
            <p>No products found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
              <h2 className="text-white text-[15px] font-medium">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#666] hover:text-white transition-colors"
              >
                {Icons.close}
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
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
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="admin-input w-full h-24 resize-none"
                  required
                />
              </div>

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

              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">
                  Product Images <span className="text-[#666]">({previewUrls.length}/10)</span>
                </label>
                
                {previewUrls.length > 0 && (
                  <div className="mb-3 grid grid-cols-5 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#262626] group">
                        <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-[#ff6166] hover:bg-[#ff7a7e] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-white text-black text-[10px] px-1.5 py-0.5 rounded font-medium">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {previewUrls.length < 10 && (
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 admin-input cursor-pointer hover:border-[#333] py-3">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {Icons.upload}
                      <span className="text-[#888] text-sm">Choose files</span>
                    </label>
                    {selectedFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={handleUploadImages}
                        disabled={uploading}
                        className="admin-btn admin-btn-primary disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : `Upload (${selectedFiles.length})`}
                      </button>
                    )}
                  </div>
                )}
                <p className="text-xs text-[#666] mt-2">
                  Upload up to 10 images. First image will be the main product image.
                </p>
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
            </form>

            <div className="px-6 py-4 border-t border-[#262626] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="admin-btn admin-btn-primary"
              >
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-white text-[15px] font-medium mb-2">Delete Product</h3>
            <p className="text-[#888] text-sm mb-6">
              This action cannot be undone. The product will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 admin-btn admin-btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminProducts() {
  return (
    <AdminAuthProvider>
      <Head>
        <title>Products — Atelier Admin</title>
      </Head>
      <AdminLayout title="Products">
        <ProductsContent />
      </AdminLayout>
    </AdminAuthProvider>
  )
}
