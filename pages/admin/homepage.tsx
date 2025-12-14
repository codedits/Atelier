import Head from 'next/head'
import { useState, useEffect } from 'react'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'
import Image from 'next/image'

interface HeroImage {
  id: string
  title: string
  subtitle: string
  image_url: string
  cta_text: string
  cta_link: string
  display_order: number
  is_active: boolean
}

interface FeaturedCollection {
  id: string
  title: string
  description: string
  image_url: string
  link: string
  display_order: number
  is_active: boolean
}

interface Testimonial {
  id: string
  customer_name: string
  content: string
  rating: number
  display_order: number
  is_active: boolean
}

// Icons
const Icons = {
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
  star: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function HomepageContent() {
  const api = useAdminApi()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'hero' | 'collections' | 'testimonials'>('hero')
  const [loading, setLoading] = useState(true)

  // Hero Images
  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const [heroModal, setHeroModal] = useState(false)
  const [editingHero, setEditingHero] = useState<HeroImage | null>(null)
  const [heroForm, setHeroForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    cta_text: '',
    cta_link: '',
    display_order: 0,
    is_active: true
  })
  const [heroUploading, setHeroUploading] = useState(false)
  const [heroSelectedFile, setHeroSelectedFile] = useState<File | null>(null)
  const [heroPreview, setHeroPreview] = useState('')

  // Collections
  const [collections, setCollections] = useState<FeaturedCollection[]>([])
  const [collectionModal, setCollectionModal] = useState(false)
  const [editingCollection, setEditingCollection] = useState<FeaturedCollection | null>(null)
  const [collectionForm, setCollectionForm] = useState({
    title: '',
    description: '',
    image_url: '',
    link: '',
    display_order: 0,
    is_active: true
  })
  const [collectionUploading, setCollectionUploading] = useState(false)
  const [collectionSelectedFile, setCollectionSelectedFile] = useState<File | null>(null)
  const [collectionPreview, setCollectionPreview] = useState('')

  // Testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [testimonialModal, setTestimonialModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [testimonialForm, setTestimonialForm] = useState({
    customer_name: '',
    content: '',
    rating: 5,
    display_order: 0,
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [heroRes, collectionsRes, testimonialsRes] = await Promise.all([
        api.get<HeroImage[]>('/hero-images'),
        api.get<FeaturedCollection[]>('/featured-collections'),
        api.get<Testimonial[]>('/testimonials'),
      ])
      setHeroImages(heroRes || [])
      setCollections(collectionsRes || [])
      setTestimonials(testimonialsRes || [])
    } catch (error) {
      console.error('Failed to load homepage content:', error)
    } finally {
      setLoading(false)
    }
  }

  // Hero Image Handlers
  const handleHeroFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }
    setHeroSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setHeroPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleHeroUpload = async () => {
    if (!heroSelectedFile) return
    setHeroUploading(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(heroSelectedFile)
      await new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1]
            const response = await api.post<{ publicUrl: string }>('/upload', {
              filename: heroSelectedFile.name,
              fileData: base64,
              contentType: heroSelectedFile.type,
              folder: 'hero'
            })
            if (response.publicUrl) {
              setHeroForm(f => ({ ...f, image_url: response.publicUrl }))
              setHeroPreview(response.publicUrl)
              toast.success('Hero image uploaded successfully')
            }
            resolve(response)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = reject
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload hero image')
    } finally {
      setHeroUploading(false)
    }
  }

  const openHeroAdd = () => {
    setEditingHero(null)
    setHeroForm({
      title: '',
      subtitle: '',
      image_url: '',
      cta_text: '',
      cta_link: '',
      display_order: heroImages.length,
      is_active: true
    })
    setHeroPreview('')
    setHeroSelectedFile(null)
    setHeroModal(true)
  }

  const openHeroEdit = (hero: HeroImage) => {
    setEditingHero(hero)
    setHeroForm({
      title: hero.title,
      subtitle: hero.subtitle,
      image_url: hero.image_url,
      cta_text: hero.cta_text,
      cta_link: hero.cta_link,
      display_order: hero.display_order,
      is_active: hero.is_active
    })
    setHeroPreview(hero.image_url)
    setHeroSelectedFile(null)
    setHeroModal(true)
  }

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingHero) {
        // If image URL changed, pass old URL so it can be deleted from storage
        const hasNewImage = heroForm.image_url !== editingHero.image_url
        await api.put('/hero-images', { 
          id: editingHero.id,
          oldImageUrl: hasNewImage ? editingHero.image_url : undefined,
          ...heroForm 
        })
        toast.success('Hero image updated successfully')
      } else {
        await api.post('/hero-images', heroForm)
        toast.success('Hero image created successfully')
      }
      setHeroModal(false)
      loadData()
    } catch (error) {
      toast.error('Failed to save hero image')
    }
  }

  const handleHeroDelete = async (id: string) => {
    if (!confirm('Delete this hero image?')) return
    try {
      await api.del(`/hero-images?id=${id}`)
      toast.success('Hero image deleted successfully')
      loadData()
    } catch {
      toast.error('Failed to delete hero image')
    }
  }

  // Collection Handlers
  const handleCollectionFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    setCollectionSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setCollectionPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleCollectionUpload = async () => {
    if (!collectionSelectedFile) return
    setCollectionUploading(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(collectionSelectedFile)
      await new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1]
            const response = await api.post<{ publicUrl: string }>('/upload', {
              filename: collectionSelectedFile.name,
              fileData: base64,
              contentType: collectionSelectedFile.type,
              folder: 'collections'
            })
            if (response.publicUrl) {
              setCollectionForm(f => ({ ...f, image_url: response.publicUrl }))
              setCollectionPreview(response.publicUrl)
              toast.success('Collection image uploaded successfully')
            }
            resolve(response)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = reject
      })
    } catch (error) {
      toast.error('Failed to upload collection image')
    } finally {
      setCollectionUploading(false)
    }
  }

  const openCollectionAdd = () => {
    setEditingCollection(null)
    setCollectionForm({
      title: '',
      description: '',
      image_url: '',
      link: '/products',
      display_order: collections.length,
      is_active: true
    })
    setCollectionPreview('')
    setCollectionSelectedFile(null)
    setCollectionModal(true)
  }

  const openCollectionEdit = (collection: FeaturedCollection) => {
    setEditingCollection(collection)
    setCollectionForm({
      title: collection.title,
      description: collection.description,
      image_url: collection.image_url,
      link: collection.link,
      display_order: collection.display_order,
      is_active: collection.is_active
    })
    setCollectionPreview(collection.image_url)
    setCollectionSelectedFile(null)
    setCollectionModal(true)
  }

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCollection) {
        // If image URL changed, pass old URL so it can be deleted from storage
        const hasNewImage = collectionForm.image_url !== editingCollection.image_url
        await api.put('/featured-collections', { 
          id: editingCollection.id,
          oldImageUrl: hasNewImage ? editingCollection.image_url : undefined,
          ...collectionForm 
        })
        toast.success('Collection updated successfully')
      } else {
        await api.post('/featured-collections', collectionForm)
        toast.success('Collection created successfully')
      }
      setCollectionModal(false)
      loadData()
    } catch (error) {
      toast.error('Failed to save collection')
    }
  }

  const handleCollectionDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return
    try {
      await api.del(`/featured-collections?id=${id}`)
      toast.success('Collection deleted successfully')
      loadData()
    } catch {
      toast.error('Failed to delete collection')
    }
  }

  // Testimonial Handlers
  const openTestimonialAdd = () => {
    setEditingTestimonial(null)
    setTestimonialForm({
      customer_name: '',
      content: '',
      rating: 5,
      display_order: testimonials.length,
      is_active: true
    })
    setTestimonialModal(true)
  }

  const openTestimonialEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setTestimonialForm({
      customer_name: testimonial.customer_name,
      content: testimonial.content,
      rating: testimonial.rating,
      display_order: testimonial.display_order,
      is_active: testimonial.is_active
    })
    setTestimonialModal(true)
  }

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTestimonial) {
        await api.put('/testimonials', { id: editingTestimonial.id, ...testimonialForm })
        toast.success('Testimonial updated successfully')
      } else {
        await api.post('/testimonials', testimonialForm)
        toast.success('Testimonial created successfully')
      }
      setTestimonialModal(false)
      loadData()
    } catch (error) {
      toast.error('Failed to save testimonial')
    }
  }

  const handleTestimonialDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return
    try {
      await api.del(`/testimonials?id=${id}`)
      toast.success('Testimonial deleted successfully')
      loadData()
    } catch {
      toast.error('Failed to delete testimonial')
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
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'hero' as const, label: 'Hero Images', count: heroImages.length },
    { id: 'collections' as const, label: 'Collections', count: collections.length },
    { id: 'testimonials' as const, label: 'Testimonials', count: testimonials.length },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#262626]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-[#666] hover:text-white'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-[11px] text-[#666]">({tab.count})</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* Hero Images Tab */}
      {activeTab === 'hero' && (
        <div className="space-y-4">
          {/* Warning: Hero is currently hardcoded */}
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
            <p className="text-yellow-500 text-sm">
              <strong>Note:</strong> The public site hero is currently set in code (<code className="bg-yellow-900/40 px-1 rounded">components/Hero.tsx</code>). 
              Changes made here are stored in the database but won&apos;t appear on the site until the hero is reconnected to the DB.
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[#888] text-sm">Manage hero carousel images</p>
            <button onClick={openHeroAdd} className="admin-btn admin-btn-primary">
              {Icons.plus}
              <span>Add Hero Image</span>
            </button>
          </div>

          <div className="grid gap-4">
            {heroImages.map(hero => (
              <div
                key={hero.id}
                className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-4 flex gap-4 hover:border-[#333] transition-colors"
              >
                <div className="relative w-48 h-28 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-[#262626]">
                  <Image src={hero.image_url} alt={hero.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-white font-medium text-sm truncate">{hero.title}</h3>
                      <p className="text-[#888] text-sm truncate">{hero.subtitle}</p>
                      {hero.cta_text && (
                        <p className="text-[#666] text-xs mt-2">
                          CTA: {hero.cta_text} → {hero.cta_link}
                        </p>
                      )}
                      <div className="flex gap-3 mt-2">
                        <span className="text-[11px] text-[#666]">Order: {hero.display_order}</span>
                        <span className={`admin-badge text-[11px] ${hero.is_active ? 'admin-badge-success' : 'admin-badge-error'}`}>
                          {hero.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => openHeroEdit(hero)}
                        className="p-2 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors"
                      >
                        {Icons.edit}
                      </button>
                      <button
                        onClick={() => handleHeroDelete(hero.id)}
                        className="p-2 text-[#666] hover:text-[#ff6166] hover:bg-[#ff616610] rounded-md transition-colors"
                      >
                        {Icons.trash}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {heroImages.length === 0 && (
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-12 text-center text-[#666]">
                No hero images yet. Add one to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collections Tab */}
      {activeTab === 'collections' && (
        <div className="space-y-4">
          {/* Info Note */}
          <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              <strong>Homepage Collections</strong> are the category cards displayed on the homepage &quot;Shop by Category&quot; section.
            </p>
            <p className="text-blue-400/70 text-xs mt-2">
              💡 Each collection links to a filtered product page. Set the <strong>Link</strong> field to <code className="bg-blue-900/40 px-1 rounded">/products?category=rings</code> (use lowercase category name).
            </p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-[#888] text-sm">Manage featured collection cards</p>
            <button onClick={openCollectionAdd} className="admin-btn admin-btn-primary">
              {Icons.plus}
              <span>Add Collection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map(collection => (
              <div
                key={collection.id}
                className="bg-[#0a0a0a] border border-[#262626] rounded-xl overflow-hidden hover:border-[#333] transition-colors"
              >
                <div className="relative h-32 bg-[#1a1a1a]">
                  <Image src={collection.image_url} alt={collection.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-medium text-sm">{collection.title}</h3>
                    <p className="text-[#aaa] text-xs truncate">{collection.description}</p>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`admin-badge text-[11px] ${collection.is_active ? 'admin-badge-success' : 'admin-badge-error'}`}>
                      {collection.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-[11px] text-[#666]">→ {collection.link}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openCollectionEdit(collection)}
                      className="p-1.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded transition-colors"
                    >
                      {Icons.edit}
                    </button>
                    <button
                      onClick={() => handleCollectionDelete(collection.id)}
                      className="p-1.5 text-[#666] hover:text-[#ff6166] hover:bg-[#ff616610] rounded transition-colors"
                    >
                      {Icons.trash}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {collections.length === 0 && (
              <div className="col-span-2 bg-[#0a0a0a] border border-[#262626] rounded-xl p-12 text-center text-[#666]">
                No collections yet. Add one to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Testimonials Tab */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[#888] text-sm">Manage customer testimonials</p>
            <button onClick={openTestimonialAdd} className="admin-btn admin-btn-primary">
              {Icons.plus}
              <span>Add Testimonial</span>
            </button>
          </div>

          <div className="grid gap-4">
            {testimonials.map(testimonial => (
              <div
                key={testimonial.id}
                className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-5 hover:border-[#333] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-medium text-sm">{testimonial.customer_name}</span>
                      <div className="flex gap-0.5 text-[#f5a623]">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <span key={i}>{Icons.star}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[#888] text-sm line-clamp-2">{testimonial.content}</p>
                    <div className="flex gap-3 mt-3">
                      <span className="text-[11px] text-[#666]">Order: {testimonial.display_order}</span>
                      <span className={`admin-badge text-[11px] ${testimonial.is_active ? 'admin-badge-success' : 'admin-badge-error'}`}>
                        {testimonial.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openTestimonialEdit(testimonial)}
                      className="p-2 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors"
                    >
                      {Icons.edit}
                    </button>
                    <button
                      onClick={() => handleTestimonialDelete(testimonial.id)}
                      className="p-2 text-[#666] hover:text-[#ff6166] hover:bg-[#ff616610] rounded-md transition-colors"
                    >
                      {Icons.trash}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {testimonials.length === 0 && (
              <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-12 text-center text-[#666]">
                No testimonials yet. Add one to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Modal */}
      {heroModal && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
              <h2 className="text-white text-[15px] font-medium">
                {editingHero ? 'Edit Hero Image' : 'Add Hero Image'}
              </h2>
              <button onClick={() => setHeroModal(false)} className="text-[#666] hover:text-white transition-colors">
                {Icons.close}
              </button>
            </div>

            <form onSubmit={handleHeroSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={heroForm.title}
                  onChange={e => setHeroForm(f => ({ ...f, title: e.target.value }))}
                  className="admin-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Subtitle</label>
                <input
                  type="text"
                  value={heroForm.subtitle}
                  onChange={e => setHeroForm(f => ({ ...f, subtitle: e.target.value }))}
                  className="admin-input w-full"
                />
              </div>

              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Image</label>
                {heroPreview && (
                  <div className="mb-3 relative w-full h-40 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#262626]">
                    <Image src={heroPreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 admin-input cursor-pointer hover:border-[#333] py-3">
                    <input type="file" accept="image/*" onChange={handleHeroFileSelect} className="hidden" />
                    {Icons.upload}
                    <span className="text-[#888] text-sm">Choose file</span>
                  </label>
                  {heroSelectedFile && (
                    <button
                      type="button"
                      onClick={handleHeroUpload}
                      disabled={heroUploading}
                      className="admin-btn admin-btn-primary disabled:opacity-50"
                    >
                      {heroUploading ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={heroForm.image_url}
                  onChange={e => setHeroForm(f => ({ ...f, image_url: e.target.value }))}
                  className="admin-input w-full mt-2"
                  placeholder="Or paste image URL..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">CTA Text</label>
                  <input
                    type="text"
                    value={heroForm.cta_text}
                    onChange={e => setHeroForm(f => ({ ...f, cta_text: e.target.value }))}
                    className="admin-input w-full"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">CTA Link</label>
                  <input
                    type="text"
                    value={heroForm.cta_link}
                    onChange={e => setHeroForm(f => ({ ...f, cta_link: e.target.value }))}
                    className="admin-input w-full"
                    placeholder="/products"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Display Order</label>
                  <input
                    type="number"
                    value={heroForm.display_order}
                    onChange={e => setHeroForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                    className="admin-input w-full"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={heroForm.is_active}
                      onChange={e => setHeroForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a]"
                    />
                    <span className="text-[#888] text-sm">Active</span>
                  </label>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-[#262626] flex justify-end gap-3">
              <button type="button" onClick={() => setHeroModal(false)} className="admin-btn admin-btn-secondary">
                Cancel
              </button>
              <button type="submit" onClick={handleHeroSubmit} className="admin-btn admin-btn-primary">
                {editingHero ? 'Save Changes' : 'Add Hero Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collection Modal */}
      {collectionModal && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
              <h2 className="text-white text-[15px] font-medium">
                {editingCollection ? 'Edit Collection' : 'Add Collection'}
              </h2>
              <button onClick={() => setCollectionModal(false)} className="text-[#666] hover:text-white transition-colors">
                {Icons.close}
              </button>
            </div>

            <form onSubmit={handleCollectionSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={collectionForm.title}
                  onChange={e => setCollectionForm(f => ({ ...f, title: e.target.value }))}
                  className="admin-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Description</label>
                <textarea
                  value={collectionForm.description}
                  onChange={e => setCollectionForm(f => ({ ...f, description: e.target.value }))}
                  className="admin-input w-full h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Image</label>
                {collectionPreview && (
                  <div className="mb-3 relative w-full h-32 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#262626]">
                    <Image src={collectionPreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 admin-input cursor-pointer hover:border-[#333] py-3">
                    <input type="file" accept="image/*" onChange={handleCollectionFileSelect} className="hidden" />
                    {Icons.upload}
                    <span className="text-[#888] text-sm">Choose file</span>
                  </label>
                  {collectionSelectedFile && (
                    <button
                      type="button"
                      onClick={handleCollectionUpload}
                      disabled={collectionUploading}
                      className="admin-btn admin-btn-primary disabled:opacity-50"
                    >
                      {collectionUploading ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  value={collectionForm.image_url}
                  onChange={e => setCollectionForm(f => ({ ...f, image_url: e.target.value }))}
                  className="admin-input w-full mt-2"
                  placeholder="Or paste image URL..."
                  required
                />
              </div>

              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Link</label>
                <input
                  type="text"
                  value={collectionForm.link}
                  onChange={e => setCollectionForm(f => ({ ...f, link: e.target.value }))}
                  className="admin-input w-full"
                  placeholder="/products?category=Rings"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Display Order</label>
                  <input
                    type="number"
                    value={collectionForm.display_order}
                    onChange={e => setCollectionForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                    className="admin-input w-full"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={collectionForm.is_active}
                      onChange={e => setCollectionForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a]"
                    />
                    <span className="text-[#888] text-sm">Active</span>
                  </label>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-[#262626] flex justify-end gap-3">
              <button type="button" onClick={() => setCollectionModal(false)} className="admin-btn admin-btn-secondary">
                Cancel
              </button>
              <button type="submit" onClick={handleCollectionSubmit} className="admin-btn admin-btn-primary">
                {editingCollection ? 'Save Changes' : 'Add Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Modal */}
      {testimonialModal && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between">
              <h2 className="text-white text-[15px] font-medium">
                {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button onClick={() => setTestimonialModal(false)} className="text-[#666] hover:text-white transition-colors">
                {Icons.close}
              </button>
            </div>

            <form onSubmit={handleTestimonialSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Customer Name</label>
                <input
                  type="text"
                  value={testimonialForm.customer_name}
                  onChange={e => setTestimonialForm(f => ({ ...f, customer_name: e.target.value }))}
                  className="admin-input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Content</label>
                <textarea
                  value={testimonialForm.content}
                  onChange={e => setTestimonialForm(f => ({ ...f, content: e.target.value }))}
                  className="admin-input w-full h-24 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setTestimonialForm(f => ({ ...f, rating }))}
                      className={`p-2 rounded transition-colors ${
                        testimonialForm.rating >= rating
                          ? 'text-[#f5a623]'
                          : 'text-[#333] hover:text-[#666]'
                      }`}
                    >
                      {Icons.star}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Display Order</label>
                  <input
                    type="number"
                    value={testimonialForm.display_order}
                    onChange={e => setTestimonialForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                    className="admin-input w-full"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={testimonialForm.is_active}
                      onChange={e => setTestimonialForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a]"
                    />
                    <span className="text-[#888] text-sm">Active</span>
                  </label>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-[#262626] flex justify-end gap-3">
              <button type="button" onClick={() => setTestimonialModal(false)} className="admin-btn admin-btn-secondary">
                Cancel
              </button>
              <button type="submit" onClick={handleTestimonialSubmit} className="admin-btn admin-btn-primary">
                {editingTestimonial ? 'Save Changes' : 'Add Testimonial'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminHomepage() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <Head>
          <title>Homepage — Atelier Admin</title>
        </Head>
        <AdminLayout title="Homepage">
          <HomepageContent />
        </AdminLayout>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
