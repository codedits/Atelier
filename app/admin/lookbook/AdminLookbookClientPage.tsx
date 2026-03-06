'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { AdminLayout } from '@/components'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
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

// Removed getServerSideProps to convert this to a static page

async function revalidateHomepage() {
    try {
        await fetch('/api/admin/revalidate?secret=' + process.env.NEXT_PUBLIC_REVALIDATION_TOKEN + '&path=/')
    } catch (e) {
        console.error('Revalidation failed', e)
    }
}

function LookbookContent() {
    const { token } = useAdminAuth()
    const toast = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // â”€â”€ Reactive state instead of window.location.reload() â”€â”€
    const [images, setImages] = useState<LookbookImage[]>([])
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState('')
    const [editingImage, setEditingImage] = useState<LookbookImage | null>(null)
    const [shuffling, setShuffling] = useState(false)
    const [savingDetails, setSavingDetails] = useState(false)

    const [sectionTitle, setSectionTitle] = useState('')
    const [sectionSubtitle, setSectionSubtitle] = useState('')
    const [savingSection, setSavingSection] = useState(false)

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

    // â”€â”€ Confirm-delete modal state â”€â”€
    const [deletingImage, setDeletingImage] = useState<LookbookImage | null>(null)
    const [deleting, setDeleting] = useState(false)

    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }), [token])

    // â”€â”€ Save section title / subtitle â”€â”€
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
            await revalidateHomepage()
        } catch (err) {
            console.error('Failed to save settings:', err)
            toast.error('Failed to save settings')
        } finally {
            setSavingSection(false)
        }
    }

    // â”€â”€ Upload images â”€â”€
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (uploading) return
        if (!files.length) return

        // Validate file types and sizes
        const invalid = files.filter(f => !ALLOWED_TYPES.includes(f.type))
        if (invalid.length) {
            toast.error(`Invalid file type: ${invalid.map(f => f.name).join(', ')}. Use JPEG, PNG, WebP or AVIF.`)
            return
        }
        const oversized = files.filter(f => f.size > MAX_FILE_SIZE)
        if (oversized.length) {
            toast.error(`Files too large (>10 MB): ${oversized.map(f => f.name).join(', ')}`)
            return
        }

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
            await revalidateHomepage()
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Error uploading images')
        } finally {
            setUploading(false)
            setUploadProgress('')
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // â”€â”€ Shuffle order â”€â”€
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
            await revalidateHomepage()
        } catch (e) {
            console.error(e)
            toast.error('Failed to shuffle order')
        } finally {
            setShuffling(false)
        }
    }

    // â”€â”€ Toggle active/inactive â”€â”€
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
            await revalidateHomepage()
        } catch (e) {
            console.error(e)
            // Revert optimistic update
            setImages(prev => prev.map(i => i.id === img.id ? { ...i, is_active: img.is_active } : i))
            toast.error('Failed to update image status')
        }
    }

    // â”€â”€ Delete image â”€â”€
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
            await revalidateHomepage()
        } catch (e) {
            console.error(e)
            toast.error('Failed to delete image')
        } finally {
            setDeletingImage(null)
            setDeleting(false)
        }
    }

    // â”€â”€ Save detail edits â”€â”€
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
            await revalidateHomepage()
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
                {/* Section Settings */}
                <div className="bg-[#111] p-4 sm:p-6 rounded-2xl border border-[#222]">
                    <h2 className="text-lg sm:text-xl font-medium text-white mb-4">Lookbook Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#888] mb-1">Section Title</label>
                            <input
                                type="text"
                                value={sectionTitle}
                                onChange={(e) => setSectionTitle(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2 text-white"
                                placeholder="e.g. THE LOOK"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#888] mb-1">Section Subtitle</label>
                            <input
                                type="text"
                                value={sectionSubtitle}
                                onChange={(e) => setSectionSubtitle(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2 text-white"
                                placeholder="e.g. Discover"
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={saveSectionSettings}
                            disabled={savingSection}
                            className="bg-white text-black px-6 py-2.5 text-sm font-medium rounded-xl hover:bg-white/90 disabled:opacity-50 transition-colors"
                        >
                            {savingSection ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>

                {/* Gallery Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-[#111] p-4 sm:p-6 rounded-2xl border border-[#222]">
                    <div>
                        <h2 className="text-lg sm:text-xl font-medium text-white">Lookbook Gallery</h2>
                        <p className="text-sm text-[#888] mt-1">
                            {images.length} image{images.length !== 1 ? 's' : ''} total &middot; {activeCount} active
                        </p>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={handleShuffle}
                            disabled={shuffling || images.length < 2}
                            className="bg-[#222] text-white px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl hover:bg-[#333] border border-[#333] transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                            {shuffling ? 'Shuffling...' : 'Shuffle'}
                        </button>
                        <button
                            disabled={uploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white text-black px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl hover:bg-white/90 disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                            {uploading ? uploadProgress : 'Upload'}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            className="hidden"
                            multiple
                            accept="image/jpeg,image/png,image/webp,image/avif"
                        />
                    </div>
                </div>

                {/* Image Grid */}
                <div className="bg-[#111] p-4 sm:p-6 rounded-2xl border border-[#222]">
                    {images.length === 0 ? (
                        <div className="py-12 text-center text-[#888] text-sm font-medium">
                            No lookbook images yet. Upload one above.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-6">
                            {images.map((img) => (
                                <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-[3/4] bg-[#1a1a1a] border border-[#222]">
                                    <Image
                                        src={img.image_url}
                                        alt={img.title || 'Lookbook reference'}
                                        fill
                                        className={`object-cover transition-opacity ${!img.is_active && 'opacity-30'}`}
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />

                                    {/* Order badge */}
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                                            #{img.display_order}
                                        </span>
                                    </div>

                                    {/* Actions -- always visible on mobile, hover on desktop */}
                                    <div className="absolute inset-x-0 bottom-0 sm:inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent sm:bg-black/60 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-row sm:flex-col items-end sm:items-center justify-center gap-1.5 sm:gap-3 p-2 sm:p-0">
                                        <button
                                            onClick={() => setEditingImage(img)}
                                            className="bg-white text-black px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg hover:bg-white/90"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(img)}
                                            className="bg-[#222] text-white px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg hover:bg-[#333] border border-[#444]"
                                        >
                                            {img.is_active ? 'Hide' : 'Show'}
                                        </button>
                                        <button
                                            onClick={() => setDeletingImage(img)}
                                            className="bg-red-500/20 text-red-400 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg hover:bg-red-500/30 border border-red-500/30"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    {/* Status Badges */}
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
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
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setEditingImage(null)}>
                    <div className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-medium text-white mb-4">Edit Image Details</h3>
                        <form onSubmit={handleSaveDetails} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#888] mb-1">Title</label>
                                <input type="text" name="title" defaultValue={editingImage.title || ''} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#888] mb-1">Subtitle</label>
                                <input type="text" name="subtitle" defaultValue={editingImage.subtitle || ''} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#888] mb-1">Link URL</label>
                                <input type="text" name="link" defaultValue={editingImage.link || ''} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2 text-white" placeholder="/products/some-slug" />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button type="button" onClick={() => setEditingImage(null)} className="px-4 py-2 text-sm font-medium text-[#888] hover:text-white transition-colors">Cancel</button>
                                <button type="submit" disabled={savingDetails} className="bg-white text-black px-4 py-2 text-sm font-medium rounded-xl hover:bg-white/90 disabled:opacity-50 transition-colors">
                                    {savingDetails ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingImage && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => !deleting && setDeletingImage(null)}>
                    <div className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-medium text-white mb-2">Delete Image</h3>
                        <p className="text-sm text-[#888] mb-6">
                            Are you sure you want to permanently delete this lookbook image{deletingImage.title ? ` "${deletingImage.title}"` : ''}? This cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setDeletingImage(null)}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-medium text-[#888] hover:text-white transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
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
