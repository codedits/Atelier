/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState, useRef } from 'react'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'
import { useDebounce } from '@/hooks/useDebounce'
export interface Category {
  id: string
  name: string
  product_count?: number
}

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
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
  const [searchQuery, setSearchQuery] = useState('')

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

  const updateCategory = async (id: string, name: string) => {
    if (!name.trim()) return
    if (submitting) return

    setSubmitting(true)
    try {
      await api.put(`/categories/${id}`, { name: name.trim() })
      toast.success('Category updated successfully')
      setEditingId(null)
      loadCategories()
    } catch {
      toast.error('Failed to update category')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteCategory = async (id: string) => {
    setDeleting(true)
    try {
      await api.del(`/categories/${id}`)
      toast.success('Category deleted successfully')
      setDeleteConfirm(null)
      loadCategories()
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setDeleting(false)
    }
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="bg-amber-900/15 border border-amber-700/30 rounded-2xl p-5 sm:p-6">
        <p className="text-amber-400 text-sm leading-relaxed">
          <strong>Category Guide:</strong> Categories are used for product types (for example <strong>Rings, Necklaces, Bracelets, Earrings, Watches</strong>).
        </p>
        <p className="text-amber-400/80 text-xs mt-3 leading-relaxed">
          Collections are curated landing pages. Manage them in <a href="/admin/collections" className="underline hover:text-amber-300 font-bold">Collections</a>.
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
        <div className="px-6 py-5 border-b border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">{Icons.search}</span>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="admin-input pl-10 w-full py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <span className="text-[#555] text-xs font-mono">{filteredCategories.length} categories</span>
          </div>
        </div>

        <div className="divide-y divide-[#1a1a1a]">
          {filteredCategories.map(category => (
            <div key={category.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#030303] transition-colors group">
              {editingId === category.id ? (
                <div className="flex gap-2 flex-1 mr-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="admin-input flex-1 py-1.5 px-3 text-sm"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') updateCategory(category.id, editName)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                  <button
                    onClick={() => updateCategory(category.id, editName)}
                    className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                  >
                    {Icons.check}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-[#666] hover:bg-[#1a1a1a] rounded-lg transition-colors"
                  >
                    {Icons.x}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium">{category.name}</span>
                      <span className="text-[#555] text-[10px] uppercase tracking-widest font-bold mt-0.5">
                        {category.product_count || 0} Products
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(category.id)
                        setEditName(category.name)
                      }}
                      className="p-2 text-[#666] hover:text-[#C9A96E] hover:bg-[#C9A96E]/5 rounded-lg transition-colors"
                      title="Edit"
                    >
                      {Icons.edit}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category.id)}
                      className="p-2 text-[#666] hover:text-[#ff6166] hover:bg-[#ff6166]/10 rounded-lg transition-colors"
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
                onClick={() => deleteCategory(deleteConfirm)}
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
        <AdminLayout title="Categories" subtitle="Manage product type categories used in filtering">
          <CategoriesContent />
        </AdminLayout>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
