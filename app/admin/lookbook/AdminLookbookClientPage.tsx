'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { AdminLayout } from '@/components'
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import { supabase } from '@/lib/supabase'

interface LookbookImage {
    id: string
    image_url: string
    display_order: number
    is_active: boolean
    title?: string
    subtitle?: string
    link?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

function LookbookContent() {
    const { token } = useAdminAuth()
    const toast = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ── Reactive state instead of window.location.reload() ──
    const [images, setImages] = useState<LookbookImage[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState('')
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const [editingImage, setEditingImage] = useState<LookbookImage | null>(null)
    const [shuffling, setShuffling] = useState(false)
    const [savingDetails, setSavingDetails] = useState(false)

    const [sectionTitle, setSectionTitle] = useState('')
    const [sectionSubtitle, setSectionSubtitle] = useState('')
    const [savingSection, setSavingSection] = useState(false)

    // â"€â"€ Batch selection â"€â"€
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [batchDeleting, setBatchDeleting] = useState(false)
    const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false)

    const selectionMode = selectedIds.size > 0
    const allSelected = images.length > 0 && selectedIds.size === images.length

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }, [])

    const toggleSelectAll = useCallback(() => {
        if (allSelected) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(images.map(i => i.id)))
        }
    }, [allSelected, images])

    // Fetch initial data client-side for SSG benefits
    useEffect(() => {
        if (!token) return

        async function fetchLookbookData() {
            try {
                const [imagesRes, sectionRes] = await Promise.all([
                    supabase.from('lookbook_images').select('*').order('display_order', { ascending: true }),
                    supabase.from('homepage_sections').select('*').eq('section_key', 'lookbook').single()
                ])

                if (imagesRes.data) setImages(imagesRes.data)

                const sectionData = sectionRes.data || { title: 'THE LOOK', subtitle: 'Discover' }
                setSectionTitle(sectionData.title)
                setSectionSubtitle(sectionData.subtitle)
            } catch (err) {
                console.error('Failed to load lookbook data', err)
                toast.error('Failed to load Lookbook data')
            } finally {
                setIsLoadingData(false)
            }
        }

        fetchLookbookData()
    }, [token])

    // ── Confirm-delete modal state ──
    const [deletingImage, setDeletingImage] = useState<LookbookImage | null>(null)
    const [deleting, setDeleting] = useState(false)

    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token])


    // ── Save section title / subtitle ──
    const saveSectionSettings = async () => {
        if (!sectionTitle.trim()) {
            toast.error('Title cannot be empty')
            return
        }
        if (savingSection) return
        setSavingSection(true)
        try {
            const res = await fetch('/api/admin/save-lookbook', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ title: sectionTitle.trim(), subtitle: sectionSubtitle.trim() })
            })
            if (!res.ok) throw new Error('Failed to save settings')
            toast.success('Lookbook settings saved')
        } catch (err) {
            console.error('Failed to save settings:', err)
            toast.error('Failed to save settings')
        } finally {
            setSavingSection(false)
        }
    }

    // ── Pick files (no auto upload) ──
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        const invalid = files.filter(f => !ALLOWED_TYPES.includes(f.type))
        if (invalid.length) {
            toast.error(`Invalid file type: ${invalid.map(f => f.name).join(', ')}. Use JPEG, PNG, WebP or AVIF.`)
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        const oversized = files.filter(f => f.size > MAX_FILE_SIZE)
        if (oversized.length) {
            toast.error(`Files too large (>10 MB): ${oversized.map(f => f.name).join(', ')}`)
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }

        setPendingFiles(files)
        toast.success(`${files.length} image(s) selected. Click Save & Upload to continue.`)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    // ── Upload selected images ──
    const handleUpload = async () => {
        const files = pendingFiles
        if (uploading) return
        if (!files.length) return

        setUploading(true)
        setUploadProgress(`Uploading 0/${files.length}...`)

        try {
            const uploadedUrls: string[] = []
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                setUploadProgress(`Uploading ${i + 1}/${files.length}...`)

                const res = await fetch('/api/admin/upload-url', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({ filename: file.name, contentType: file.type, folder: 'lookbook' })
                })
                if (!res.ok) throw new Error(`Failed to get upload URL for ${file.name}`)
                const { signedUrl, publicUrl } = await res.json()

                const uploadRes = await fetch(signedUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file
                })
                if (!uploadRes.ok) throw new Error(`Failed to upload ${file.name}`)
                uploadedUrls.push(publicUrl)
            }

            // Assign proper display_order based on existing max
            const maxOrder = images.reduce((max, img) => Math.max(max, img.display_order), 0)
            const newRecords = uploadedUrls.map((url, i) => ({
                image_url: url,
                display_order: maxOrder + i + 1,
                is_active: true
            }))

            const saveRes = await fetch('/api/admin/lookbook-images', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ records: newRecords })
            })
            if (!saveRes.ok) throw new Error('Failed to save image records')

            const { data: inserted } = await saveRes.json()

            // Optimistic update -- append new images to local state
            if (inserted && Array.isArray(inserted)) {
                setImages(prev => [...prev, ...inserted])
            } else {
                // Fallback -- refetch
                const { data: refreshed } = await supabase
                    .from('lookbook_images')
                    .select('*')
                    .order('display_order', { ascending: true })
                if (refreshed) setImages(refreshed)
            }

            toast.success(`${uploadedUrls.length} image(s) uploaded`)
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Error uploading images')
        } finally {
            setUploading(false)
            setUploadProgress('')
            setPendingFiles([])
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // ── Shuffle order ──
    const handleShuffle = async () => {
        if (shuffling) return
        setShuffling(true)
        try {
            const updates = images.map(img => ({
                ...img,
                display_order: Math.floor(Math.random() * 10000)
            }))

            const res = await fetch('/api/admin/lookbook-images', {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ updates })
            })
            if (!res.ok) throw new Error('Shuffle failed')

            // Sort locally by new order
            const sorted = [...updates].sort((a, b) => a.display_order - b.display_order)
            setImages(sorted)
            toast.success('Order shuffled')
        } catch (e) {
            console.error(e)
            toast.error('Failed to shuffle order')
        } finally {
            setShuffling(false)
        }
    }

    // ── Toggle active/inactive ──
    const handleToggleActive = async (img: LookbookImage) => {
        const newStatus = !img.is_active
        // Optimistic update
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, is_active: newStatus } : i))
        try {
            const res = await fetch('/api/admin/lookbook-images', {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ id: img.id, updates: { is_active: newStatus } })
            })
            if (!res.ok) throw new Error('Toggle failed')
            toast.success(newStatus ? 'Image activated' : 'Image hidden')
        } catch (e) {
            console.error(e)
            // Revert optimistic update
            setImages(prev => prev.map(i => i.id === img.id ? { ...i, is_active: img.is_active } : i))
            toast.error('Failed to update image status')
        }
    }

    // ── Delete image ──
    const handleDelete = async () => {
        if (!deletingImage) return
        if (deleting) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/lookbook-images?id=${deletingImage.id}`, {
                method: 'DELETE',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            })
            if (!res.ok) throw new Error('Delete failed')
            setImages(prev => prev.filter(i => i.id !== deletingImage.id))
            toast.success('Image deleted')
        } catch (e) {
            console.error(e)
            toast.error('Failed to delete image')
        } finally {
            setDeletingImage(null)
            setDeleting(false)
        }
    }
    // â"€â"€ Batch delete â"€â"€
    const handleBatchDelete = async () => {
        if (batchDeleting || selectedIds.size === 0) return
        setBatchDeleting(true)
        try {
            const idsParam = Array.from(selectedIds).join(',')
            const res = await fetch(`/api/admin/lookbook-images?ids=${encodeURIComponent(idsParam)}`, {
                method: 'DELETE',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            })
            if (!res.ok) throw new Error('Batch delete failed')
            setImages(prev => prev.filter(i => !selectedIds.has(i.id)))
            toast.success(`${selectedIds.size} image(s) deleted`)
            setSelectedIds(new Set())
        } catch (e) {
            console.error(e)
            toast.error('Failed to delete selected images')
        } finally {
            setBatchDeleting(false)
            setShowBatchDeleteConfirm(false)
        }
    }

    // â"€â"€ Batch toggle visibility â"€â"€
    const handleBatchToggle = async (active: boolean) => {
        const ids = Array.from(selectedIds)
        // Optimistic
        setImages(prev => prev.map(i => selectedIds.has(i.id) ? { ...i, is_active: active } : i))
        try {
            for (const id of ids) {
                const res = await fetch('/api/admin/lookbook-images', {
                    method: 'PUT',
                    headers: authHeaders(),
                    body: JSON.stringify({ id, updates: { is_active: active } })
                })
                if (!res.ok) throw new Error('Toggle failed')
            }
            toast.success(`${ids.length} image(s) ${active ? 'activated' : 'hidden'}`)
            setSelectedIds(new Set())
        } catch (e) {
            console.error(e)
            toast.error('Failed to update images')
            // Refetch on error
            const { data } = await supabase.from('lookbook_images').select('*').order('display_order', { ascending: true })
            if (data) setImages(data)
        }
    }
    // ── Save detail edits ──
    const handleSaveDetails = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (savingDetails) return
        if (!editingImage) return
        setSavingDetails(true)
        const formData = new FormData(e.currentTarget)
        const updates = {
            title: (formData.get('title') as string || '').trim(),
            subtitle: (formData.get('subtitle') as string || '').trim(),
            link: (formData.get('link') as string || '').trim(),
        }
        try {
            const res = await fetch('/api/admin/lookbook-images', {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ id: editingImage.id, updates })
            })
            if (!res.ok) throw new Error('Failed to save')
            setImages(prev => prev.map(i => i.id === editingImage.id ? { ...i, ...updates } : i))
            setEditingImage(null)
            toast.success('Image details saved')
        } catch (err) {
            console.error(err)
            toast.error('Failed to save details')
        } finally {
            setSavingDetails(false)
        }
    }

    const activeCount = images.filter(i => i.is_active).length

    if (isLoadingData) {
        return (
            <AdminLayout title="Manage Lookbook" subtitle="Upload and reorder gallery images">
                <div className="flex justify-center items-center py-20 min-h-[50vh]">
                    <div className="animate-spin h-8 w-8 border-2 border-[#fff] border-t-transparent rounded-full" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout title="Manage Lookbook" subtitle="Upload and reorder gallery images">
            <div className="space-y-6">
                {/* Section Settings Card */}
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 border-b border-[#1a1a1a]">
                        <h2 className="text-white text-base font-semibold">Lookbook Settings</h2>
                        <p className="text-[#666] text-xs mt-0.5">Configure section title and subtitle displayed on the homepage</p>
                    </div>
                    <div className="p-5 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Section Title</label>
                                <input
                                    type="text"
                                    value={sectionTitle}
                                    onChange={(e) => setSectionTitle(e.target.value)}
                                    className="admin-input w-full"
                                    placeholder="e.g. THE LOOK"
                                />
                            </div>
                            <div>
                                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Section Subtitle</label>
                                <input
                                    type="text"
                                    value={sectionSubtitle}
                                    onChange={(e) => setSectionSubtitle(e.target.value)}
                                    className="admin-input w-full"
                                    placeholder="e.g. Discover"
                                />
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end">
                            <button
                                onClick={saveSectionSettings}
                                disabled={savingSection}
                                className="admin-btn admin-btn-primary disabled:opacity-50"
                            >
                                {savingSection ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Gallery Header */}
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                            <h2 className="text-white text-base font-semibold">Lookbook Gallery</h2>
                            <p className="text-[#666] text-xs mt-0.5">
                                {images.length} image{images.length !== 1 ? 's' : ''} total &middot; {activeCount} active
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={handleShuffle}
                                disabled={shuffling || images.length < 2}
                                className="admin-btn admin-btn-secondary text-[13px] disabled:opacity-50"
                            >
                                {shuffling ? 'Shuffling...' : 'Shuffle Order'}
                            </button>
                            <button
                                disabled={uploading}
                                onClick={() => fileInputRef.current?.click()}
                                className="admin-btn admin-btn-primary text-[13px] disabled:opacity-50"
                            >
                                {pendingFiles.length > 0 ? `Selected (${pendingFiles.length})` : 'Select Images'}
                            </button>
                            {pendingFiles.length > 0 && (
                                <button
                                    disabled={uploading}
                                    onClick={handleUpload}
                                    className="admin-btn admin-btn-secondary text-[13px] disabled:opacity-50"
                                >
                                    {uploading ? uploadProgress : 'Save & Upload'}
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                multiple
                                accept="image/jpeg,image/png,image/webp,image/avif"
                            />
                        </div>
                    </div>

                    {/* Selection toolbar — shown when images exist */}
                    {images.length > 0 && (
                        <div className="px-5 sm:px-6 py-3 border-t border-[#1a1a1a] flex flex-wrap items-center gap-3">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded border-[#444] bg-[#0a0a0a] accent-white cursor-pointer"
                                />
                                <span className="text-[13px] text-[#a1a1a1] font-medium">
                                    {allSelected ? 'Deselect All' : 'Select All'}
                                </span>
                            </label>

                            {selectionMode && (
                                <>
                                    <span className="text-[12px] text-[#666]">|</span>
                                    <span className="text-[13px] text-white font-medium">
                                        {selectedIds.size} selected
                                    </span>
                                    <span className="text-[12px] text-[#666]">|</span>
                                    <button
                                        onClick={() => handleBatchToggle(true)}
                                        className="text-[13px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                    >
                                        Show All
                                    </button>
                                    <button
                                        onClick={() => handleBatchToggle(false)}
                                        className="text-[13px] text-orange-400 hover:text-orange-300 font-medium transition-colors"
                                    >
                                        Hide All
                                    </button>
                                    <button
                                        onClick={() => setShowBatchDeleteConfirm(true)}
                                        className="text-[13px] text-red-400 hover:text-red-300 font-medium transition-colors"
                                    >
                                        Delete Selected
                                    </button>
                                    <button
                                        onClick={() => setSelectedIds(new Set())}
                                        className="text-[13px] text-[#666] hover:text-white font-medium transition-colors ml-auto"
                                    >
                                        Clear
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Image Grid */}
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 sm:p-6">
                    {images.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="text-[#444] mb-3">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="m21 15-5-5L5 21" />
                                </svg>
                            </div>
                            <p className="text-[#666] text-sm font-medium">No lookbook images yet</p>
                            <p className="text-[#444] text-xs mt-1">Upload images above to build your lookbook gallery</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {images.map((img) => {
                                const isSelected = selectedIds.has(img.id)
                                return (
                                    <div
                                        key={img.id}
                                        className={`relative group rounded-xl overflow-hidden aspect-[3/4] bg-[#1a1a1a] border-2 transition-all cursor-pointer
                                            ${isSelected ? 'border-white ring-2 ring-white/20 scale-[0.97]' : 'border-[#1a1a1a] hover:border-[#333]'}`}
                                        onClick={() => toggleSelect(img.id)}
                                    >
                                        <Image
                                            src={img.image_url}
                                            alt={img.title || 'Lookbook'}
                                            fill
                                            className={`object-cover transition-all ${!img.is_active ? 'opacity-30 grayscale' : ''} ${isSelected ? 'brightness-75' : ''}`}
                                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                                        />

                                        {/* Checkbox */}
                                        <div className={`absolute top-2.5 left-2.5 z-10 transition-opacity ${isSelected || selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                                                ${isSelected ? 'bg-white border-white' : 'bg-black/40 border-white/60 backdrop-blur-sm'}`}
                                            >
                                                {isSelected && (
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order badge */}
                                        <div className="absolute top-2.5 right-2.5">
                                            <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                                                #{img.display_order}
                                            </span>
                                        </div>

                                        {/* Actions — stop propagation so clicks don't toggle selection */}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2.5 flex gap-1.5 justify-center"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <button
                                                onClick={() => setEditingImage(img)}
                                                className="bg-white text-black px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg hover:bg-white/90 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(img)}
                                                className="bg-[#222] text-white px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg hover:bg-[#333] border border-[#444] transition-colors"
                                            >
                                                {img.is_active ? 'Hide' : 'Show'}
                                            </button>
                                            <button
                                                onClick={() => setDeletingImage(img)}
                                                className="bg-red-500/20 text-red-400 px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg hover:bg-red-500/30 border border-red-500/30 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>

                                        {/* Status Badges */}
                                        {(!img.is_active || img.title) && (
                                            <div className="absolute bottom-10 sm:bottom-2 left-2 flex flex-col gap-1 pointer-events-none sm:group-hover:opacity-0 transition-opacity">
                                                {!img.is_active && (
                                                    <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 text-[10px] font-semibold rounded-md w-fit">
                                                        Hidden
                                                    </span>
                                                )}
                                                {img.title && (
                                                    <span className="bg-black/50 backdrop-blur-sm text-white border border-white/10 px-2 py-0.5 text-[10px] font-semibold rounded-md max-w-[100px] truncate" title={img.title}>
                                                        {img.title}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingImage && (
                <div className="fixed inset-0 admin-modal-overlay z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setEditingImage(null)}>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
                            <h3 className="text-white text-base font-semibold">Edit Image Details</h3>
                            <button onClick={() => setEditingImage(null)} className="w-9 h-9 flex items-center justify-center text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSaveDetails} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Title</label>
                                <input type="text" name="title" defaultValue={editingImage.title || ''} className="admin-input w-full" placeholder="Image title" />
                            </div>
                            <div>
                                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Subtitle</label>
                                <input type="text" name="subtitle" defaultValue={editingImage.subtitle || ''} className="admin-input w-full" placeholder="Image subtitle" />
                            </div>
                            <div>
                                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Link URL</label>
                                <input type="text" name="link" defaultValue={editingImage.link || ''} className="admin-input w-full" placeholder="/products/some-slug" />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setEditingImage(null)} className="admin-btn admin-btn-secondary">Cancel</button>
                                <button type="submit" disabled={savingDetails} className="admin-btn admin-btn-primary disabled:opacity-50">
                                    {savingDetails ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Single Delete Confirmation Modal */}
            {deletingImage && (
                <div className="fixed inset-0 admin-modal-overlay z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => !deleting && setDeletingImage(null)}>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            </div>
                            <h3 className="text-white text-base font-semibold mb-2">Delete Image</h3>
                            <p className="text-[#888] text-sm">
                                Are you sure you want to permanently delete this lookbook image{deletingImage.title ? ` "${deletingImage.title}"` : ''}? This cannot be undone.
                            </p>
                        </div>
                        <div className="px-6 pb-6 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setDeletingImage(null)}
                                disabled={deleting}
                                className="admin-btn admin-btn-secondary disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="admin-btn admin-btn-danger disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Delete Confirmation Modal */}
            {showBatchDeleteConfirm && (
                <div className="fixed inset-0 admin-modal-overlay z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => !batchDeleting && setShowBatchDeleteConfirm(false)}>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            </div>
                            <h3 className="text-white text-base font-semibold mb-2">Delete {selectedIds.size} Images</h3>
                            <p className="text-[#888] text-sm">
                                This will permanently delete {selectedIds.size} selected image{selectedIds.size !== 1 ? 's' : ''} and remove them from storage. This cannot be undone.
                            </p>
                        </div>
                        <div className="px-6 pb-6 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowBatchDeleteConfirm(false)}
                                disabled={batchDeleting}
                                className="admin-btn admin-btn-secondary disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBatchDelete}
                                disabled={batchDeleting}
                                className="admin-btn admin-btn-danger disabled:opacity-50"
                            >
                                {batchDeleting ? 'Deleting...' : `Delete ${selectedIds.size} Images`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}

export default function AdminLookbookClientPage() {
    return (
        <AdminAuthProvider>
            <ToastProvider>
                <LookbookContent />
            </ToastProvider>
        </AdminAuthProvider>
    )
}
