import Head from 'next/head'
import { useState, useEffect } from 'react'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAdminApi } from '@/hooks/useAdminApi'
import Image from 'next/image'
import AdminImageUpload from '@/components/admin/AdminImageUpload'

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

interface Announcement {
  id: string
  text: string
  link: string
  link_text: string
  icon: string
  display_order: number
  is_active: boolean
}

interface HomepageSection {
  id: string
  section_key: string
  title: string
  subtitle: string
  content: string
  image_url: string
  cta_text: string
  cta_link: string
  metadata: any
  is_active: boolean
}

// Icons
const Icons = {
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
  star: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function HomepageContent() {
  const api = useAdminApi()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'hero' | 'collections' | 'testimonials' | 'announcements' | 'brand_story' | 'craftsmanship' | 'process_steps' | 'limited_drop'>('hero')
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
  const [heroPreview, setHeroPreview] = useState('')

  // Hero Overlay
  const [heroOverlay, setHeroOverlay] = useState({
    color: '#000000',
    opacity: 40,
    gradient_from: 60,
    gradient_to: 20,
    gradient_enabled: true
  })
  const [overlaySaving, setOverlaySaving] = useState(false)

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

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [announcementModal, setAnnouncementModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [announcementForm, setAnnouncementForm] = useState({
    text: '',
    link: '',
    link_text: '',
    icon: 'sparkle',
    display_order: 0,
    is_active: true
  })

  // Homepage Sections (brand_story, craftsmanship, process_steps)
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>([])
  const [sectionSaving, setSectionSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [heroRes, collectionsRes, testimonialsRes, announcementsRes, sectionsRes, overlayRes] = await Promise.all([
        api.get<HeroImage[]>('/hero-images'),
        api.get<FeaturedCollection[]>('/featured-collections'),
        api.get<Testimonial[]>('/testimonials'),
        api.get<Announcement[]>('/announcements'),
        api.get<HomepageSection[]>('/homepage-sections'),
        api.get<any>('/hero-overlay'),
      ])
      setHeroImages(heroRes || [])
      setCollections(collectionsRes || [])
      setTestimonials(testimonialsRes || [])
      setAnnouncements(announcementsRes || [])
      setHomepageSections(sectionsRes || [])
      if (overlayRes) {
        setHeroOverlay(prev => ({ ...prev, ...overlayRes }))
      }
    } catch (error) {
      console.error('Failed to load homepage content:', error)
    } finally {
      setLoading(false)
    }
  }

  // Busts the frontend ISR cache for the given tags
  const revalidateFrontend = async (tags: string | string[]) => {
    try {
      await api.post('/revalidate', { tag: tags })
    } catch (e) {
      console.warn('Cache revalidation failed, frontend may serve stale content:', e)
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
      revalidateFrontend('hero_images')
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
      revalidateFrontend('hero_images')
    } catch {
      toast.error('Failed to delete hero image')
    }
  }

  const handleOverlaySave = async () => {
    setOverlaySaving(true)
    try {
      await api.put('/hero-overlay', heroOverlay)
      toast.success('Overlay settings saved')
    } catch {
      toast.error('Failed to save overlay settings')
    } finally {
      setOverlaySaving(false)
    }
  }

  // Collection Handlers
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
      revalidateFrontend('featured_collections')
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
      revalidateFrontend('featured_collections')
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
      revalidateFrontend('testimonials')
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
      revalidateFrontend('testimonials')
    } catch {
      toast.error('Failed to delete testimonial')
    }
  }

  // Announcement Handlers
  const openAnnouncementAdd = () => {
    setEditingAnnouncement(null)
    setAnnouncementForm({
      text: '',
      link: '',
      link_text: '',
      icon: 'sparkle',
      display_order: announcements.length,
      is_active: true
    })
    setAnnouncementModal(true)
  }

  const openAnnouncementEdit = (a: Announcement) => {
    setEditingAnnouncement(a)
    setAnnouncementForm({
      text: a.text,
      link: a.link || '',
      link_text: a.link_text || '',
      icon: a.icon || 'sparkle',
      display_order: a.display_order,
      is_active: a.is_active
    })
    setAnnouncementModal(true)
  }

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAnnouncement) {
        await api.put('/announcements', { id: editingAnnouncement.id, ...announcementForm })
        toast.success('Announcement updated')
      } else {
        await api.post('/announcements', announcementForm)
        toast.success('Announcement created')
      }
      setAnnouncementModal(false)
      loadData()
    } catch {
      toast.error('Failed to save announcement')
    }
  }

  const handleAnnouncementDelete = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await api.del(`/announcements?id=${id}`)
      toast.success('Announcement deleted')
      loadData()
    } catch {
      toast.error('Failed to delete announcement')
    }
  }

  // Homepage Section Helpers
  const getSection = (key: string): HomepageSection | undefined =>
    homepageSections.find(s => s.section_key === key)

  const saveSection = async (sectionData: any) => {
    setSectionSaving(true)
    try {
      await api.put('/homepage-sections', sectionData)
      toast.success('Section saved')
      loadData()
    } catch {
      toast.error('Failed to save section')
    } finally {
      setSectionSaving(false)
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
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'hero' as const, label: 'Hero Images', count: heroImages.length },
    { id: 'collections' as const, label: 'Collections', count: collections.length },
    { id: 'testimonials' as const, label: 'Testimonials', count: testimonials.length },
    { id: 'announcements' as const, label: 'Announcements', count: announcements.length },
    { id: 'brand_story' as const, label: 'Brand Story' },
    { id: 'craftsmanship' as const, label: 'Craftsmanship' },
    { id: 'process_steps' as const, label: 'Process Steps' },
    { id: 'limited_drop' as const, label: 'Limited Drop' },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#1a1a1a]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${activeTab === tab.id
              ? 'text-white'
              : 'text-[#666] hover:text-white'
              }`}
          >
            {tab.label}
            {'count' in tab && typeof tab.count === 'number' && (
              <span className="ml-2 text-[11px] text-[#666]">({tab.count})</span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* Hero Images Tab */}
      {activeTab === 'hero' && (
        <div className="space-y-4">

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
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 flex gap-4 hover:border-[#333] transition-colors"
              >
                <div className="relative w-48 h-28 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-[#1a1a1a]">
                  <Image src={hero.image_url} alt={hero.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate">{hero.title}</h3>
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
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 text-center text-[#666]">
                No hero images yet. Add one to get started.
              </div>
            )}
          </div>

          {/* Hero Overlay Settings */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-5 mt-6">
            <h3 className="text-white text-sm font-semibold">Dark Overlay Settings</h3>
            <p className="text-[#666] text-xs">Controls the dark overlay on top of hero images to ensure text readability.</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Overlay Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={heroOverlay.color}
                    onChange={e => setHeroOverlay(o => ({ ...o, color: e.target.value }))}
                    className="w-10 h-10 rounded border border-[#333] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={heroOverlay.color}
                    onChange={e => setHeroOverlay(o => ({ ...o, color: e.target.value }))}
                    className="admin-input flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">
                  Flat Overlay Opacity: <span className="text-white">{heroOverlay.opacity}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={heroOverlay.opacity}
                  onChange={e => setHeroOverlay(o => ({ ...o, opacity: Number(e.target.value) }))}
                  className="w-full accent-white h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#666] mt-1">
                  <span>0% (none)</span>
                  <span>100% (black)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1a1a1a]">
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={heroOverlay.gradient_enabled}
                  onChange={e => setHeroOverlay(o => ({ ...o, gradient_enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a]"
                />
                <span className="text-[#a1a1a1] text-sm">Enable gradient overlay (darker at bottom for text)</span>
              </label>

              {heroOverlay.gradient_enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">
                      Bottom (from): <span className="text-white">{heroOverlay.gradient_from}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={heroOverlay.gradient_from}
                      onChange={e => setHeroOverlay(o => ({ ...o, gradient_from: Number(e.target.value) }))}
                      className="w-full accent-white h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">
                      Top (to): <span className="text-white">{heroOverlay.gradient_to}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={heroOverlay.gradient_to}
                      onChange={e => setHeroOverlay(o => ({ ...o, gradient_to: Number(e.target.value) }))}
                      className="w-full accent-white h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preview bar */}
            <div className="relative h-16 rounded-lg overflow-hidden border border-[#1a1a1a]">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-white to-gray-300" />
              <div className="absolute inset-0" style={{ backgroundColor: heroOverlay.color, opacity: heroOverlay.opacity / 100 }} />
              {heroOverlay.gradient_enabled && (() => {
                const hex = heroOverlay.color || '#000000'
                const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16)
                return <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(${r},${g},${b},${heroOverlay.gradient_from/100}), transparent, rgba(${r},${g},${b},${heroOverlay.gradient_to/100}))` }} />
              })()}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-medium drop-shadow-lg">Preview — Text Readability Check</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={handleOverlaySave} disabled={overlaySaving} className="admin-btn admin-btn-primary disabled:opacity-50">
                {overlaySaving ? 'Saving...' : 'Save Overlay'}
              </button>
            </div>
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
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden hover:border-[#333] transition-colors"
              >
                <div className="relative h-32 bg-[#1a1a1a]">
                  <Image src={collection.image_url} alt={collection.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-semibold text-sm">{collection.title}</h3>
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
              <div className="col-span-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 text-center text-[#666]">
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
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#333] transition-colors"
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
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 text-center text-[#666]">
                No testimonials yet. Add one to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[#888] text-sm">Manage the announcement ticker at the top of the homepage</p>
            <button onClick={openAnnouncementAdd} className="admin-btn admin-btn-primary">
              {Icons.plus}
              <span>Add Announcement</span>
            </button>
          </div>

          <div className="grid gap-4">
            {announcements.map(a => (
              <div key={a.id} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 flex items-center gap-4 hover:border-[#333] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#C9A96E] text-sm flex-shrink-0">
                  {a.icon === 'gift' ? '🎁' : a.icon === 'clock' ? '⏰' : a.icon === 'star' ? '⭐' : '✨'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{a.text}</p>
                  {a.link && <p className="text-[#666] text-xs mt-1">{a.link_text || 'Link'} → {a.link}</p>}
                  <div className="flex gap-3 mt-1">
                    <span className="text-[11px] text-[#666]">Order: {a.display_order}</span>
                    <span className={`admin-badge text-[11px] ${a.is_active ? 'admin-badge-success' : 'admin-badge-error'}`}>
                      {a.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openAnnouncementEdit(a)} className="p-2 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-md transition-colors">
                    {Icons.edit}
                  </button>
                  <button onClick={() => handleAnnouncementDelete(a.id)} className="p-2 text-[#666] hover:text-[#ff6166] hover:bg-[#ff616610] rounded-md transition-colors">
                    {Icons.trash}
                  </button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 text-center text-[#666]">
                No announcements yet. Add one to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Brand Story Tab */}
      {activeTab === 'brand_story' && (() => {
        const section = getSection('brand_story')
        const meta = section?.metadata || {}
        return <BrandStoryEditor section={section} meta={meta} onSave={saveSection} saving={sectionSaving} />
      })()}

      {/* Craftsmanship Tab */}
      {activeTab === 'craftsmanship' && (() => {
        const section = getSection('craftsmanship')
        const meta = section?.metadata || {}
        return <CraftsmanshipEditor section={section} meta={meta} onSave={saveSection} saving={sectionSaving} />
      })()}

      {/* Process Steps Tab */}
      {activeTab === 'process_steps' && (() => {
        const section = getSection('process_steps')
        const meta = section?.metadata || {}
        return <ProcessStepsEditor section={section} meta={meta} onSave={saveSection} saving={sectionSaving} />
      })()}

      {/* Limited Drop Tab */}
      {activeTab === 'limited_drop' && (() => {
        const section = getSection('limited_drop')
        const meta = section?.metadata || {}
        return <LimitedDropEditor section={section} meta={meta} onSave={saveSection} saving={sectionSaving} />
      })()}

      {/* Hero Modal */}
      {heroModal && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
              <h2 className="text-white text-base font-semibold">
                {editingHero ? 'Edit Hero Image' : 'Add Hero Image'}
              </h2>
              <button onClick={() => setHeroModal(false)} className="w-9 h-9 flex items-center justify-center text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors">
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
                <AdminImageUpload
                  value={heroForm.image_url}
                  onChange={(url) => { setHeroForm(f => ({ ...f, image_url: url })); setHeroPreview(url); }}
                  label="Image"
                  folder="hero"
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

            <div className="px-6 py-4 border-t border-[#1a1a1a] flex justify-end gap-3">
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
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
              <h2 className="text-white text-base font-semibold">
                {editingCollection ? 'Edit Collection' : 'Add Collection'}
              </h2>
              <button onClick={() => setCollectionModal(false)} className="w-9 h-9 flex items-center justify-center text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors">
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
                <AdminImageUpload
                  value={collectionForm.image_url}
                  onChange={(url) => { setCollectionForm(f => ({ ...f, image_url: url })); setCollectionPreview(url); }}
                  label="Image"
                  folder="collections"
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

            <div className="px-6 py-4 border-t border-[#1a1a1a] flex justify-end gap-3">
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
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
              <h2 className="text-white text-base font-semibold">
                {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button onClick={() => setTestimonialModal(false)} className="w-9 h-9 flex items-center justify-center text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors">
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
                      className={`p-2 rounded transition-colors ${testimonialForm.rating >= rating
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

            <div className="px-6 py-4 border-t border-[#1a1a1a] flex justify-end gap-3">
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
      {/* Announcement Modal */}
      {announcementModal && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
              <h2 className="text-white text-base font-semibold">
                {editingAnnouncement ? 'Edit Announcement' : 'Add Announcement'}
              </h2>
              <button onClick={() => setAnnouncementModal(false)} className="w-9 h-9 flex items-center justify-center text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors">
                {Icons.close}
              </button>
            </div>

            <form onSubmit={handleAnnouncementSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Text</label>
                <input
                  type="text"
                  value={announcementForm.text}
                  onChange={e => setAnnouncementForm(f => ({ ...f, text: e.target.value }))}
                  className="admin-input w-full"
                  placeholder="New Spring Collection Just Dropped"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Link</label>
                  <input
                    type="text"
                    value={announcementForm.link}
                    onChange={e => setAnnouncementForm(f => ({ ...f, link: e.target.value }))}
                    className="admin-input w-full"
                    placeholder="/products"
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Link Text</label>
                  <input
                    type="text"
                    value={announcementForm.link_text}
                    onChange={e => setAnnouncementForm(f => ({ ...f, link_text: e.target.value }))}
                    className="admin-input w-full"
                    placeholder="Shop Now"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Icon</label>
                <div className="flex gap-2">
                  {['sparkle', 'gift', 'clock', 'star'].map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setAnnouncementForm(f => ({ ...f, icon }))}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${announcementForm.icon === icon ? 'bg-[#C9A96E] text-black' : 'bg-[#1a1a1a] text-[#888] hover:text-white'}`}
                    >
                      {icon === 'gift' ? '🎁' : icon === 'clock' ? '⏰' : icon === 'star' ? '⭐' : '✨'} {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Display Order</label>
                  <input
                    type="number"
                    value={announcementForm.display_order}
                    onChange={e => setAnnouncementForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                    className="admin-input w-full"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcementForm.is_active}
                      onChange={e => setAnnouncementForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a]"
                    />
                    <span className="text-[#888] text-sm">Active</span>
                  </label>
                </div>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-[#1a1a1a] flex justify-end gap-3">
              <button type="button" onClick={() => setAnnouncementModal(false)} className="admin-btn admin-btn-secondary">
                Cancel
              </button>
              <button type="submit" onClick={handleAnnouncementSubmit} className="admin-btn admin-btn-primary">
                {editingAnnouncement ? 'Save Changes' : 'Add Announcement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Section Editor Components ---

function BrandStoryEditor({ section, meta, onSave, saving }: { section: any; meta: any; onSave: (d: any) => Promise<void>; saving: boolean }) {
  const [title, setTitle] = useState(section?.title || 'Where tradition meets modern artistry')
  const [subtitle, setSubtitle] = useState(section?.subtitle || 'Our Story')
  const [content, setContent] = useState(section?.content || '')
  const [imageUrl, setImageUrl] = useState(section?.image_url || '')
  const [highlightWord, setHighlightWord] = useState(meta.highlight_word || 'modern artistry')
  const [ctaText, setCtaText] = useState(meta.cta_text || 'Discover Our Full Story')
  const [ctaLink, setCtaLink] = useState(meta.cta_link || '/about')
  const [milestones, setMilestones] = useState<{ year: string; text: string }[]>(meta.milestones || [])
  const [images, setImages] = useState<{ url: string; alt: string; caption: string }[]>(meta.images || [])

  const handleSave = () => {
    onSave({
      section_key: 'brand_story',
      title,
      subtitle,
      content,
      image_url: imageUrl,
      metadata: { highlight_word: highlightWord, cta_text: ctaText, cta_link: ctaLink, milestones, images }
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        <h3 className="text-white text-sm font-semibold">Content</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="admin-input w-full" />
          </div>
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Subtitle</label>
            <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="admin-input w-full" />
          </div>
        </div>
        <div>
          <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Description</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="admin-input w-full h-20 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Highlight Word (italic gold text)</label>
            <input type="text" value={highlightWord} onChange={e => setHighlightWord(e.target.value)} className="admin-input w-full" placeholder="modern artistry" />
          </div>
          <div>
            <AdminImageUpload value={imageUrl} onChange={setImageUrl} label="Background Image" folder="hero" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">CTA Text</label>
            <input type="text" value={ctaText} onChange={e => setCtaText(e.target.value)} className="admin-input w-full" />
          </div>
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">CTA Link</label>
            <input type="text" value={ctaLink} onChange={e => setCtaLink(e.target.value)} className="admin-input w-full" />
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-sm font-semibold">Milestones</h3>
          <button type="button" onClick={() => setMilestones([...milestones, { year: '', text: '' }])} className="admin-btn admin-btn-primary text-xs">
            + Add Milestone
          </button>
        </div>
        {milestones.map((m, i) => (
          <div key={i} className="flex gap-3 items-start">
            <input
              type="text"
              value={m.year}
              onChange={e => { const arr = [...milestones]; arr[i] = { ...arr[i], year: e.target.value }; setMilestones(arr) }}
              className="admin-input w-24"
              placeholder="2024"
            />
            <input
              type="text"
              value={m.text}
              onChange={e => { const arr = [...milestones]; arr[i] = { ...arr[i], text: e.target.value }; setMilestones(arr) }}
              className="admin-input flex-1"
              placeholder="Description..."
            />
            <button type="button" onClick={() => setMilestones(milestones.filter((_, j) => j !== i))} className="p-2 text-[#666] hover:text-[#ff6166] transition-colors">
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Gallery Images */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-sm font-semibold">Gallery Images</h3>
          <button type="button" onClick={() => setImages([...images, { url: '', alt: '', caption: '' }])} className="admin-btn admin-btn-primary text-xs">
            + Add Image
          </button>
        </div>
        {images.map((img, i) => (
          <div key={i} className="space-y-3 bg-[#111] border border-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[#666] text-[11px] uppercase tracking-wider">Image {i + 1}</span>
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="p-1 text-[#666] hover:text-[#ff6166] transition-colors text-xs">
                ✕ Remove
              </button>
            </div>
            <AdminImageUpload
              value={img.url}
              onChange={(url) => { const arr = [...images]; arr[i] = { ...arr[i], url }; setImages(arr) }}
              label="Image"
              folder="hero"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#a1a1a1] text-[11px] font-medium mb-1">Alt text</label>
                <input
                  type="text"
                  value={img.alt}
                  onChange={e => { const arr = [...images]; arr[i] = { ...arr[i], alt: e.target.value }; setImages(arr) }}
                  className="admin-input w-full"
                  placeholder="Alt text"
                />
              </div>
              <div>
                <label className="block text-[#a1a1a1] text-[11px] font-medium mb-1">Caption</label>
                <input
                  type="text"
                  value={img.caption}
                  onChange={e => { const arr = [...images]; arr[i] = { ...arr[i], caption: e.target.value }; setImages(arr) }}
                  className="admin-input w-full"
                  placeholder="Caption"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Brand Story'}
        </button>
      </div>
    </div>
  )
}

function CraftsmanshipEditor({ section, meta, onSave, saving }: { section: any; meta: any; onSave: (d: any) => Promise<void>; saving: boolean }) {
  const [title, setTitle] = useState(section?.title || 'Handcrafted Excellence')
  const [subtitle, setSubtitle] = useState(section?.subtitle || 'Our Heritage')
  const [content, setContent] = useState(section?.content || '')
  const [imageUrl, setImageUrl] = useState(section?.image_url || '')
  const [stats, setStats] = useState<{ value: string; label: string }[]>(meta.stats || [])

  const handleSave = () => {
    onSave({
      section_key: 'craftsmanship',
      title,
      subtitle,
      content,
      image_url: imageUrl,
      metadata: { stats }
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        <h3 className="text-white text-sm font-semibold">Content</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="admin-input w-full" />
          </div>
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Subtitle</label>
            <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="admin-input w-full" />
          </div>
        </div>
        <div>
          <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Content (use blank lines to split paragraphs)</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="admin-input w-full h-28 resize-none" />
        </div>
        <AdminImageUpload value={imageUrl} onChange={setImageUrl} label="Image" folder="hero" />
      </div>

      {/* Stats */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-sm font-semibold">Stats</h3>
          <button type="button" onClick={() => setStats([...stats, { value: '', label: '' }])} className="admin-btn admin-btn-primary text-xs">
            + Add Stat
          </button>
        </div>
        {stats.map((s, i) => (
          <div key={i} className="flex gap-3 items-start">
            <input
              type="text"
              value={s.value}
              onChange={e => { const arr = [...stats]; arr[i] = { ...arr[i], value: e.target.value }; setStats(arr) }}
              className="admin-input w-24"
              placeholder="35+"
            />
            <input
              type="text"
              value={s.label}
              onChange={e => { const arr = [...stats]; arr[i] = { ...arr[i], label: e.target.value }; setStats(arr) }}
              className="admin-input flex-1"
              placeholder="Years of Artistry"
            />
            <button type="button" onClick={() => setStats(stats.filter((_, j) => j !== i))} className="p-2 text-[#666] hover:text-[#ff6166] transition-colors">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Craftsmanship'}
        </button>
      </div>
    </div>
  )
}

function ProcessStepsEditor({ section, meta, onSave, saving }: { section: any; meta: any; onSave: (d: any) => Promise<void>; saving: boolean }) {
  const [title, setTitle] = useState(section?.title || 'From Vision to Reality')
  const [subtitle, setSubtitle] = useState(section?.subtitle || 'Our Process')
  const [steps, setSteps] = useState<{ number: string; title: string; description: string }[]>(meta.steps || [])

  const handleSave = () => {
    onSave({
      section_key: 'process_steps',
      title,
      subtitle,
      metadata: { steps }
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        <h3 className="text-white text-sm font-semibold">Section Header</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="admin-input w-full" />
          </div>
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Subtitle</label>
            <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="admin-input w-full" />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-sm font-semibold">Steps</h3>
          <button type="button" onClick={() => setSteps([...steps, { number: String(steps.length + 1).padStart(2, '0'), title: '', description: '' }])} className="admin-btn admin-btn-primary text-xs">
            + Add Step
          </button>
        </div>
        {steps.map((s, i) => (
          <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#C9A96E] font-mono text-sm">Step {s.number}</span>
              <button type="button" onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="p-1 text-[#666] hover:text-[#ff6166] transition-colors text-xs">
                Remove
              </button>
            </div>
            <div className="grid grid-cols-[80px,1fr] gap-3">
              <div>
                <label className="block text-[#a1a1a1] text-[11px] mb-1">Number</label>
                <input
                  type="text"
                  value={s.number}
                  onChange={e => { const arr = [...steps]; arr[i] = { ...arr[i], number: e.target.value }; setSteps(arr) }}
                  className="admin-input w-full"
                />
              </div>
              <div>
                <label className="block text-[#a1a1a1] text-[11px] mb-1">Title</label>
                <input
                  type="text"
                  value={s.title}
                  onChange={e => { const arr = [...steps]; arr[i] = { ...arr[i], title: e.target.value }; setSteps(arr) }}
                  className="admin-input w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-[#a1a1a1] text-[11px] mb-1">Description</label>
              <textarea
                value={s.description}
                onChange={e => { const arr = [...steps]; arr[i] = { ...arr[i], description: e.target.value }; setSteps(arr) }}
                className="admin-input w-full h-16 resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Process Steps'}
        </button>
      </div>
    </div>
  )
}

function LimitedDropEditor({ section, meta, onSave, saving }: { section: any; meta: any; onSave: (d: any) => Promise<void>; saving: boolean }) {
  const [title, setTitle] = useState(section?.title || 'The Midnight Collection')
  const [subtitle, setSubtitle] = useState(section?.subtitle || 'Limited Edition')
  const [content, setContent] = useState(section?.content || 'An exclusive capsule of 48 hand-finished pieces, each uniquely numbered.')
  const [imageUrl, setImageUrl] = useState(section?.image_url || '')
  const [targetDate, setTargetDate] = useState(meta.target_date ? new Date(meta.target_date).toISOString().slice(0, 16) : '')
  const [totalPieces, setTotalPieces] = useState<number>(meta.total_pieces || 48)
  const [badgeText, setBadgeText] = useState(meta.badge_text || 'Dropping Soon')
  const [ctaText, setCtaText] = useState(meta.cta_text || 'Reserve Yours')
  const [ctaLink, setCtaLink] = useState(meta.cta_link || '/products')

  const handleSave = () => {
    onSave({
      section_key: 'limited_drop',
      title,
      subtitle,
      content,
      image_url: imageUrl,
      metadata: {
        target_date: targetDate ? new Date(targetDate).toISOString() : null,
        total_pieces: totalPieces,
        badge_text: badgeText,
        cta_text: ctaText,
        cta_link: ctaLink,
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Content */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        <h3 className="text-white text-sm font-semibold">Content</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="admin-input w-full" placeholder="The Midnight Collection" />
          </div>
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Subtitle</label>
            <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="admin-input w-full" placeholder="Limited Edition" />
          </div>
        </div>
        <div>
          <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Description</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="admin-input w-full h-24 resize-none" placeholder="An exclusive capsule of hand-finished pieces..." />
        </div>
        <AdminImageUpload value={imageUrl} onChange={setImageUrl} label="Product / Hero Image" folder="hero" />
      </div>

      {/* Countdown & Drop Settings */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        <h3 className="text-white text-sm font-semibold">Drop Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Drop Date & Time</label>
            <input
              type="datetime-local"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="admin-input w-full"
            />
            <p className="text-[#555] text-[11px] mt-1">Countdown timer counts down to this date</p>
          </div>
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Total Pieces</label>
            <input
              type="number"
              min={1}
              value={totalPieces}
              onChange={e => setTotalPieces(parseInt(e.target.value) || 1)}
              className="admin-input w-full"
            />
            <p className="text-[#555] text-[11px] mt-1">Shows "Only X pieces worldwide"</p>
          </div>
        </div>
        <div>
          <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Badge Text</label>
          <input type="text" value={badgeText} onChange={e => setBadgeText(e.target.value)} className="admin-input w-full" placeholder="Dropping Soon" />
          <p className="text-[#555] text-[11px] mt-1">Appears as a floating badge on the image. Leave blank to hide.</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-4">
        <h3 className="text-white text-sm font-semibold">Call to Action</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Button Text</label>
            <input type="text" value={ctaText} onChange={e => setCtaText(e.target.value)} className="admin-input w-full" placeholder="Reserve Yours" />
          </div>
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Button Link</label>
            <input type="text" value={ctaLink} onChange={e => setCtaLink(e.target.value)} className="admin-input w-full" placeholder="/products" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Limited Drop'}
        </button>
      </div>
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
        <AdminLayout title="Homepage" subtitle="Customize your storefront">
          <HomepageContent />
        </AdminLayout>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
