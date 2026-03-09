/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'
import AdminImageUpload from '@/components/admin/AdminImageUpload'

export interface Collection {
    id: string
    name: string
    slug: string
    description: string | null
    image_url: string | null
    is_active: boolean
    display_order: number
    created_at: string
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
    external: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    ),
    search: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    )
}

function CollectionsContent() {
    const api = useAdminApi()
    const toast = useToast()
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [originalImageUrl, setOriginalImageUrl] = useState<string>('')
    const [formData, setFormData] = useState<Partial<Collection>>({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        is_active: true,
        display_order: 0
    })

    useEffect(() => {
        loadCollections()
    }, [])

    const loadCollections = async () => {
        setLoading(true)
        try {
            const data = await api.get<Collection[]>('/collections')
            setCollections(data)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenModal = (collection?: Collection) => {
        if (collection) {
            setEditingId(collection.id)
            setOriginalImageUrl(collection.image_url || '')
            setFormData({
                name: collection.name,
                slug: collection.slug,
                description: collection.description || '',
                image_url: collection.image_url || '',
                is_active: collection.is_active,
                display_order: collection.display_order
            })
        } else {
            setEditingId(null)
            setOriginalImageUrl('')
            setFormData({
                name: '',
                slug: '',
                description: '',
                image_url: '',
                is_active: true,
                display_order: collections.length
            })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingId(null)
    }

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.slug) {
            toast.error('Name and Slug are required')
            return
        }

        setSubmitting(true)
        try {
            if (editingId) {
                const hasNewImage = formData.image_url !== originalImageUrl
                await api.put(`/collections/${editingId}`, {
                    ...formData,
                    oldImageUrl: hasNewImage ? originalImageUrl : undefined
                })
                toast.success('Collection updated')
            } else {
                await api.post('/collections', formData)
                toast.success('Collection created')
            }
            handleCloseModal()
            loadCollections()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save collection')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this collection?')) return

        setDeleting(true)
        try {
            await api.del(`/collections/${id}`)
            toast.success('Collection deleted')
            loadCollections()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete collection')
        } finally {
            setDeleting(false)
        }
    }

    const filteredCollections = collections.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-[#666]">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm">Loading collections...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl space-y-8">
            {/* Search and Action Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4">
                <div className="relative w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#555]">
                        {Icons.search}
                    </div>
                    <input
                        type="text"
                        placeholder="Search collections..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="admin-input w-full pl-10 py-2 text-sm"
                    />
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="admin-btn admin-btn-primary py-2 px-6 flex items-center gap-2 whitespace-nowrap w-full sm:w-auto justify-center"
                >
                    {Icons.plus} New Collection
                </button>
            </div>

            {/* Curation Guide */}
            <div className="bg-blue-900/10 border border-blue-700/20 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                    <div className="mt-1 text-blue-400 font-bold">i</div>
                    <div>
                        <h2 className="text-blue-400 font-medium mb-1 text-sm">Curation Management</h2>
                        <p className="text-blue-400/70 text-xs leading-relaxed">
                            Collections group products for exclusive drops. Live collections are accessible at
                            <code className="bg-blue-900/40 px-1 rounded text-blue-300 ml-1">/collections/[slug]</code>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCollections.map(collection => (
                    <div key={collection.id} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden group hover:border-[#333] transition-colors shadow-sm">
                        <div className="aspect-[21/9] relative bg-[#111] overflow-hidden">
                            {collection.image_url ? (
                                <img
                                    src={collection.image_url}
                                    alt={collection.name}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#333] text-xs">No Banner</div>
                            )}

                            <div className="absolute top-2 right-2 flex gap-2">
                                {!collection.is_active ? (
                                    <span className="bg-yellow-500/10 text-yellow-500 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-yellow-500/20 backdrop-blur-md">Draft</span>
                                ) : (
                                    <span className="bg-green-500/10 text-green-500 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border border-green-500/20 backdrop-blur-md">Live</span>
                                )}
                            </div>

                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/5 flex items-center gap-1.5">
                                <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Items:</span>
                                <span className="text-[10px] text-white font-mono">{collection.product_count || 0}</span>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-white font-medium text-base leading-tight truncate pr-4">{collection.name}</h3>
                                {collection.is_active && (
                                    <a
                                        href={`/collections/${collection.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#444] hover:text-[#C9A96E] transition-colors mt-0.5"
                                        title="View Live Page"
                                    >
                                        {Icons.external}
                                    </a>
                                )}
                            </div>
                            <p className="text-[#555] text-[11px] mb-4 font-mono truncate">/{collection.slug}</p>

                            <div className="flex gap-2 border-t border-[#1a1a1a] pt-4 mt-2">
                                <button
                                    onClick={() => handleOpenModal(collection)}
                                    className="flex-1 admin-btn admin-btn-secondary py-2 text-xs flex items-center justify-center gap-2"
                                >
                                    {Icons.edit} Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(collection.id)}
                                    className="px-3 admin-btn admin-btn-danger flex items-center justify-center"
                                    disabled={deleting}
                                    title="Delete"
                                >
                                    {Icons.trash}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCollections.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed border-[#1a1a1a] rounded-xl bg-[#030303]">
                        <p className="text-[#a1a1a1] text-sm mb-1">{searchQuery ? 'No matching collections' : 'Your curated drops will appear here'}</p>
                        <p className="text-[#555] text-xs mb-6">
                            {searchQuery ? `Try searching for something else` : 'Launch your first exclusive collection today.'}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="admin-btn admin-btn-primary py-2 px-8 mx-auto inline-flex items-center gap-2 text-xs"
                            >
                                {Icons.plus} Create Collection
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between z-10">
                            <h3 className="text-white font-semibold text-sm">
                                {editingId ? 'Edit Collection' : 'New Collection'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-[#444] hover:text-white transition-colors">
                                {Icons.x}
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[#666] text-[10px] uppercase tracking-widest font-bold">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => {
                                            const val = e.target.value
                                            setFormData(prev => ({
                                                ...prev,
                                                name: val,
                                                ...(!editingId ? { slug: generateSlug(val) } : {})
                                            }))
                                        }}
                                        className="admin-input w-full text-sm"
                                        placeholder="e.g. Summer Bridal 2026"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[#666] text-[10px] uppercase tracking-widest font-bold">URL Slug</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                                        className="admin-input w-full text-sm font-mono"
                                        placeholder="summer-bridal-2026"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#666] text-[10px] uppercase tracking-widest font-bold">Description</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="admin-input w-full min-h-[100px] resize-y text-sm"
                                    placeholder="Write a few words about this curated drop..."
                                />
                            </div>

                            <div>
                                <AdminImageUpload
                                    value={formData.image_url || ''}
                                    onChange={url => setFormData(prev => ({ ...prev, image_url: url }))}
                                    label="Hero Banner Image"
                                    folder="collections"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#1a1a1a] pt-6">
                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <div className={`w-10 h-5 rounded-full transition-all relative ${formData.is_active ? 'bg-[#C9A96E]' : 'bg-[#1a1a1a]'}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${formData.is_active ? 'translate-x-5' : ''}`} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-white text-[13px] font-medium transition-colors group-hover:text-[#C9A96E]">Published</span>
                                        <span className="block text-[#555] text-[10px] mt-0.5">Visible to customers and in navigation</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.is_active}
                                        onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                    />
                                </label>
                                <div className="space-y-2">
                                    <label className="block text-[#666] text-[10px] uppercase tracking-widest font-bold">Sort Priority</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={e => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                                        className="admin-input w-24 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-[#1a1a1a]">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="admin-btn admin-btn-secondary px-6 text-xs"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary px-8 text-xs font-bold uppercase tracking-widest"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Saving...' : 'Save Collection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>

    )
}

export default function AdminCollectionsClientPage() {
    return (
        <AdminAuthProvider>
            <ToastProvider>
                <AdminLayout title="Collections" subtitle="Manage exclusive launches and curated drops">
                    <CollectionsContent />
                </AdminLayout>
            </ToastProvider>
        </AdminAuthProvider>
    )
}
