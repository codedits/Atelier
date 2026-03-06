/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState, useRef } from 'react'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'
import { useDebounce } from '@/hooks/useDebounce'
import { Category } from '@/lib/supabase'

// Icons
const Icons = {
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function CategoriesContent() {
  const api = useAdminApi()
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const pendingUpdatesRef = useRef<Map<string, string>>(new Map())

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await api.get<Category[]>('/categories')
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    if (submitting) return

    setSubmitting(true)

    try {
      await api.post('/categories', { name: newName.trim() })
      setNewName('')
      toast.success('Category added successfully')
      loadCategories()
    } catch {
      toast.error('Failed to add category')
    } finally {
      setSubmitting(false)
    }
  }

  const performCategoryUpdate = async (id: string, name: string) => {
    try {
      await api.put(`/categories/${id}`, { name: name.trim() })
      toast.success('Category updated')
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name: name.trim() } : c))
      pendingUpdatesRef.current.delete(id)
    } catch (error) {
      console.error('Failed to update category:', error)
      toast.error('Failed to update category')
    }
  }

  const { debounced: debouncedCategoryUpdate } = useDebounce(
    performCategoryUpdate,
    400 // 400ms debounce for text input
  )

  const updateCategory = async (id: string, name: string) => {
    if (!name.trim()) return

    // Store pending update
    pendingUpdatesRef.current.set(id, name)

    // Update UI immediately
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c))

    if (deleting) return
    setDeleting(true)
    try {
      await api.del(`/categories/${id}`)
      toast.success('Category deleted successfully')
      setDeleteConfirm(null)
      loadCategories()
    } catch {
      toast.error('Failed to delete category. Make sure no products are using it.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[#666]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Loading categories...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Info Note */}
      <div className="bg-blue-900/15 border border-blue-700/30 rounded-2xl p-5 sm:p-6">
        <p className="text-blue-400 text-sm leading-relaxed">
          <strong>What are Categories?</strong> Categories are used to tag and organize your <strong>products</strong> (e.g., Rings, Necklaces, Bracelets).
          When adding or editing a product, you&apos;ll assign it to one of these categories.
        </p>
        <p className="text-blue-400/70 text-xs mt-3 leading-relaxed">
          💡 To display categories on the homepage, go to <a href="/admin/homepage" className="underline hover:text-blue-300">Homepage → Collections</a> and add a collection card for each category you want to feature.
        </p>
      </div>

      {/* Add New Category */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#1a1a1a]">
          <h3 className="text-base font-semibold text-white">Add New Category</h3>
          <p className="text-[#666] text-sm mt-1">Create a new category to organize your products</p>
        </div>
        <div className="p-6">
          <form onSubmit={addCategory} className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Category name..."
              disabled={submitting}
              className="admin-input flex-1 py-3 px-4 text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="admin-btn admin-btn-primary py-3 px-5 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : Icons.plus}
              <span>{submitting ? 'Adding...' : 'Add'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">All Categories</h3>
            <p className="text-[#666] text-sm mt-1">Manage your product categories</p>
          </div>
          <span className="admin-badge admin-badge-neutral text-xs px-3 py-1.5">{categories.length} total</span>
        </div>

        <div className="divide-y divide-[#1a1a1a]">
          {categories.map(category => (
            <div key={category.id} className="px-6 py-5 flex items-center justify-between hover:bg-[#111] transition-colors">
              {editingId === category.id ? (
                <div className="flex gap-3 flex-1 mr-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="admin-input flex-1 py-3 px-4 text-sm"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') updateCategory(category.id, editName)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                  <button
                    onClick={() => updateCategory(category.id, editName)}
                    className="admin-btn admin-btn-primary px-4 py-3"
                    title="Save"
                  >
                    {Icons.check}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="admin-btn admin-btn-secondary px-4 py-3"
                    title="Cancel"
                  >
                    {Icons.x}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#222] flex items-center justify-center text-[#555]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(category.id)
                        setEditName(category.name)
                      }}
                      className="p-2.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
                      title="Edit"
                    >
                      {Icons.edit}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category.id)}
                      className="p-2.5 text-[#666] hover:text-[#ff6166] hover:bg-[#ff6166]/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      {Icons.trash}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-white text-sm font-medium mb-1">No categories yet</p>
            <p className="text-[#555] text-sm">Add your first category above to get started.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 sm:p-8 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-[#ff4444]/10 flex items-center justify-center mx-auto mb-4">
              {Icons.trash}
            </div>
            <h3 className="text-white text-base font-semibold mb-2 text-center">Delete Category</h3>
            <p className="text-[#777] text-sm mb-6 text-center">
              Make sure no products are using this category before deleting.
            </p>
            <div className="flex gap-3">
              <button
                disabled={deleting}
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 admin-btn admin-btn-secondary py-2.5"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={() => updateCategory(deleteConfirm, '')}
                className="flex-1 admin-btn admin-btn-danger py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminCategoriesClientPage() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <AdminLayout title="Categories" subtitle="Organize your products into collections">
          <CategoriesContent />
        </AdminLayout>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
