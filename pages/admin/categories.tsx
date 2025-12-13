import { useEffect, useState } from 'react'
import Head from 'next/head'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'
import { Category } from '@/lib/supabase'

// Icons
const Icons = {
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function CategoriesContent() {
  const api = useAdminApi()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

    try {
      await api.post('/categories', { name: newName.trim() })
      setNewName('')
      loadCategories()
    } catch {
      alert('Failed to add category')
    }
  }

  const updateCategory = async (id: string) => {
    if (!editName.trim()) return

    try {
      await api.put(`/categories/${id}`, { name: editName.trim() })
      setEditingId(null)
      loadCategories()
    } catch {
      alert('Failed to update category')
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      await api.del(`/categories/${id}`)
      setDeleteConfirm(null)
      loadCategories()
    } catch {
      alert('Failed to delete category. Make sure no products are using it.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-[#666]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span className="text-sm">Loading categories...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Info Note */}
      <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          <strong>What are Categories?</strong> Categories are used to tag and organize your <strong>products</strong> (e.g., Rings, Necklaces, Bracelets). 
          When adding or editing a product, you&apos;ll assign it to one of these categories.
        </p>
        <p className="text-blue-400/70 text-xs mt-2">
          💡 To display categories on the homepage, go to <a href="/admin/homepage" className="underline hover:text-blue-300">Homepage → Collections</a> and add a collection card for each category you want to feature.
        </p>
      </div>

      {/* Add New Category */}
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#262626]">
          <h3 className="text-[15px] font-medium text-white">Add New Category</h3>
        </div>
        <div className="p-5">
          <form onSubmit={addCategory} className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Category name..."
              className="admin-input flex-1"
            />
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
            >
              {Icons.plus}
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#262626] flex items-center justify-between">
          <h3 className="text-[15px] font-medium text-white">All Categories</h3>
          <span className="admin-badge admin-badge-neutral">{categories.length} total</span>
        </div>
        
        <div className="divide-y divide-[#262626]">
          {categories.map(category => (
            <div key={category.id} className="px-5 py-4 flex items-center justify-between hover:bg-[#111] transition-colors">
              {editingId === category.id ? (
                <div className="flex gap-2 flex-1 mr-4">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="admin-input flex-1"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === 'Enter') updateCategory(category.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                  <button
                    onClick={() => updateCategory(category.id)}
                    className="admin-btn admin-btn-primary px-3"
                    title="Save"
                  >
                    {Icons.check}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="admin-btn admin-btn-secondary px-3"
                    title="Cancel"
                  >
                    {Icons.x}
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-white text-sm">{category.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(category.id)
                        setEditName(category.name)
                      }}
                      className="p-2 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors"
                      title="Edit"
                    >
                      {Icons.edit}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category.id)}
                      className="p-2 text-[#666] hover:text-[#ff6166] hover:bg-[#ff616610] rounded-md transition-colors"
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
          <div className="p-12 text-center text-[#666]">
            <p>No categories yet. Add your first category above.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-white text-[15px] font-medium mb-2">Delete Category</h3>
            <p className="text-[#888] text-sm mb-6">
              Make sure no products are using this category before deleting.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCategory(deleteConfirm)}
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

export default function AdminCategories() {
  return (
    <AdminAuthProvider>
      <Head>
        <title>Categories — Atelier Admin</title>
      </Head>
      <AdminLayout title="Categories">
        <CategoriesContent />
      </AdminLayout>
    </AdminAuthProvider>
  )
}
