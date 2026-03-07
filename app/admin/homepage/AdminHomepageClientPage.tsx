/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminVideoUpload from '@/components/admin/AdminVideoUpload'
import Announcement from '@/components/AnnouncementBanner'
import { useAdminApi } from '@/hooks/useAdminApi'
import Image from 'next/image'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// ── Section meta for layout preview ──────────────────────────────────
const SECTION_META: Record<string, { icon: string; label: string; description: string }> = {
  hero: { icon: '🖼️', label: 'Hero Carousel', description: 'Full-width hero images' },
  feature_video: { icon: '🎬', label: 'Feature Video', description: 'Full-screen background video' },
  limited_drop: { icon: '⏱️', label: 'Limited Drop', description: 'Countdown and exclusive drop' },
  announcement_banner: { icon: '📢', label: 'Announcements', description: 'Scrolling announcement bar' },
  value_proposition: { icon: '💎', label: 'Value Proposition', description: 'Brand value cards' },
  featured_collections: { icon: '📦', label: 'Collections', description: 'Category cards grid' },
  logo_marquee: { icon: '🏷️', label: 'Logo Marquee', description: 'Scrolling brand logos' },
  collections_highlight: { icon: '✨', label: 'Collections Highlight', description: 'Highlighted collections' },
  process_steps: { icon: '🔧', label: 'Process Steps', description: 'Step-by-step process' },
  lookbook: { icon: '📷', label: 'Lookbook', description: 'Photo gallery grid' },
  trending_now: { icon: '🔥', label: 'Trending Now', description: 'Featured products carousel' },
  craftsmanship: { icon: '🛠️', label: 'Craftsmanship', description: 'Artisan craftsmanship section' },
  brand_story: { icon: '📖', label: 'Brand Story', description: 'Our story section' },
  new_arrivals: { icon: '🆕', label: 'New Arrivals', description: 'Latest products grid' },
  testimonials: { icon: '⭐', label: 'Testimonials', description: 'Customer reviews carousel' },
  instagram_gallery: { icon: '📸', label: 'Instagram', description: 'Instagram feed grid' },
  newsletter: { icon: '✉️', label: 'Newsletter', description: 'Email signup section' },
}

const ALL_HOMEPAGE_SECTIONS = [
  'hero', 'limited_drop', 'announcement_banner', 'value_proposition', 'featured_collections',
  'logo_marquee', 'collections_highlight', 'process_steps', 'lookbook', 'trending_now', 'craftsmanship',
  'brand_story', 'new_arrivals', 'testimonials', 'instagram_gallery', 'newsletter'
]

// ── Sortable layout card ─────────────────────────────────────────────
function SortableLayoutCard({ id, isPinned, onRemove }: { id: string; isPinned?: boolean; onRemove?: (id: string) => void }) {
  const baseKey = id.startsWith('feature_video') ? 'feature_video' : id
  const meta = SECTION_META[baseKey] || { icon: '📄', label: id.replace(/_/g, ' '), description: '' }
  const isVideo = id.startsWith('feature_video')
  const videoIndex = isVideo && id.includes(':') ? id.split(':')[1] : '0'

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled: isPinned });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 mb-2 rounded-xl border transition-colors ${isPinned
        ? 'bg-[#0d0d0d] border-[#C9A96E]/30'
        : 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]'
        }`}
    >
      {/* Drag handle or pin */}
      {isPinned ? (
        <div className="text-[#C9A96E]" title="Pinned — cannot be moved">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
          </svg>
        </div>
      ) : (
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-[#555] hover:text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </div>
      )}

      {/* Icon */}
      <span className="text-xl flex-shrink-0">{meta.icon}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">
          {meta.label}{isVideo && id.includes(':') ? ` #${parseInt(videoIndex) + 1}` : ''}
        </p>
        <p className="text-[#666] text-xs truncate">{meta.description}</p>
      </div>

      {/* Pinned badge or remove */}
      {isPinned ? (
        <span className="text-[10px] text-[#C9A96E] uppercase tracking-wider font-medium">Pinned</span>
      ) : onRemove ? (
        <button
          onClick={() => onRemove(id)}
          className="p-1.5 text-[#555] hover:text-[#ff6166] hover:bg-[#ff616610] rounded-md transition-colors"
          title="Remove from layout"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

// ── Feature Video Tab (local state + explicit Save) ──────────────────
function FeatureVideoTab({ data, sectionSaving, saveSection }: {
  data: any
  sectionSaving: boolean
  saveSection: (d: any) => Promise<void>
}) {
  const [form, setForm] = useState({
    title: data.title || '',
    cta_text: data.cta_text || '',
    cta_link: data.cta_link || '',
    text_color: data.metadata?.text_color || '#FFFFFF',
    cta_color: data.metadata?.cta_color || '#FFFFFF',
  })
  const [dirty, setDirty] = useState(false)

  // Sync from server when data changes (e.g. after toggle)
  useEffect(() => {
    setForm({
      title: data.title || '',
      cta_text: data.cta_text || '',
      cta_link: data.cta_link || '',
      text_color: data.metadata?.text_color || '#FFFFFF',
      cta_color: data.metadata?.cta_color || '#FFFFFF',
    })
    setDirty(false)
  }, [data.title, data.cta_text, data.cta_link, data.metadata?.text_color, data.metadata?.cta_color])

  const update = (patch: Partial<typeof form>) => {
    setForm(prev => ({ ...prev, ...patch }))
    setDirty(true)
  }

  const handleSave = async () => {
    await saveSection({
      ...data,
      title: form.title,
      cta_text: form.cta_text,
      cta_link: form.cta_link,
      metadata: {
        ...(data.metadata || {}),
        text_color: form.text_color,
        cta_color: form.cta_color,
      },
    })
    setDirty(false)
  }

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 sm:p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-white text-lg font-semibold">100vh Feature Video</h3>
          <p className="text-[#888] text-sm mt-1">Displayed immediately below the main hero section.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enable-feature-video"
            checked={data.is_active}
            onChange={(e) => saveSection({ ...data, is_active: e.target.checked })}
            className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a] accent-[#C9A96E]"
            disabled={sectionSaving}
          />
          <label htmlFor="enable-feature-video" className="text-sm text-[#888] cursor-pointer selection:bg-transparent">
            Enable Section
          </label>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <AdminVideoUpload
            label="Background Video (MP4/WebM) - Max 50MB"
            value={data.image_url}
            onChange={(url) => saveSection({ ...data, image_url: url })}
            folder="feature_video"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Overlay Header Text</label>
            <input
              type="text"
              value={form.title}
              onChange={e => update({ title: e.target.value })}
              className="admin-input w-full"
              placeholder="e.g. ATELIER"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Button Link Text</label>
            <input
              type="text"
              value={form.cta_text}
              onChange={e => update({ cta_text: e.target.value })}
              className="admin-input w-full"
              placeholder="e.g. Shop Collection"
            />
          </div>
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Button URL</label>
            <input
              type="text"
              value={form.cta_link}
              onChange={e => update({ cta_link: e.target.value })}
              className="admin-input w-full"
              placeholder="e.g. /products"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Header Text Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.text_color}
                onChange={e => update({ text_color: e.target.value })}
                className="w-10 h-10 rounded border border-[#333] bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={form.text_color}
                onChange={e => update({ text_color: e.target.value })}
                className="admin-input flex-1"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
          <div>
            <label className="block text-[#a1a1a1] text-[13px] font-medium mb-2">Button Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.cta_color}
                onChange={e => update({ cta_color: e.target.value })}
                className="w-10 h-10 rounded border border-[#333] bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={form.cta_color}
                onChange={e => update({ cta_color: e.target.value })}
                className="admin-input flex-1"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={sectionSaving || !dirty}
            className="admin-btn admin-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sectionSaving ? 'Saving...' : dirty ? 'Save Changes' : 'Saved'}
          </button>
        </div>

        {data.image_url && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[#a1a1a1] text-[13px] font-medium">Preview</label>
              {!data.is_active && <span className="text-[10px] text-red-500 uppercase tracking-wider">Section Disabled - Preview Paused</span>}
            </div>
            <div className="relative w-full aspect-video md:aspect-[21/9] rounded-lg overflow-hidden bg-black border border-[#1a1a1a]">
              {data.is_active ? (
                <>
                  <video
                    src={data.image_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                    <h2
                      className="text-white text-3xl md:text-5xl font-light tracking-[0.2em] mb-4 font-serif"
                      style={{ color: form.text_color }}
                    >
                      {form.title}
                    </h2>
                    {form.cta_text && (
                      <div
                        className="text-[10px] uppercase tracking-[0.2em] flex items-center gap-1"
                        style={{ color: form.cta_color }}
                      >
                        {form.cta_text}
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] text-[#444] text-xs flex-col gap-2">
                  <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.36 18.36A9 9 0 015.64 5.64m12.72 12.72L5.64 5.64" />
                  </svg>
                  <span>Enable section to preview video</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HomepageContent() {
  const api = useAdminApi()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'layout' | 'hero' | 'feature_video' | 'collections' | 'testimonials' | 'announcements' | 'brand_story' | 'craftsmanship' | 'process_steps' | 'limited_drop'>('layout')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Delete confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: string; label: string } | null>(null)

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

  // ── Layout state ──────────────────────────────────────────────────
  const [layout, setLayout] = useState<string[]>([])
  const [layoutSaving, setLayoutSaving] = useState(false)

  const dndSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [heroRes, collectionsRes, testimonialsRes, announcementsRes, sectionsRes, overlayRes, cfgRes] = await Promise.all([
        api.get<HeroImage[]>('/hero-images'),
        api.get<FeaturedCollection[]>('/featured-collections'),
        api.get<Testimonial[]>('/testimonials'),
        api.get<Announcement[]>('/announcements'),
        api.get<HomepageSection[]>('/homepage-sections'),
        api.get<any>('/hero-overlay'),
        api.get<any>('/site-config'),
      ])
      setHeroImages(heroRes || [])
      setCollections(collectionsRes || [])
      setTestimonials(testimonialsRes || [])
      setAnnouncements(announcementsRes || [])
      setHomepageSections(sectionsRes || [])
      if (overlayRes) {
        setHeroOverlay(prev => ({ ...prev, ...overlayRes }))
      }
      // Load layout from site_config
      if (cfgRes?.homepage_layout) {
        setLayout(cfgRes.homepage_layout)
      } else {
        setLayout([
          'hero', 'feature_video', 'limited_drop', 'announcement_banner', 'value_proposition', 'featured_collections',
          'logo_marquee', 'process_steps', 'trending_now', 'craftsmanship', 'new_arrivals', 'testimonials',
          'instagram_gallery', 'newsletter'
        ])
      }
    } catch (error) {
      console.error('Failed to load homepage content:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  // Busts the frontend ISR cache for the given tags — only needed
  // for operations that don't go through a server API route.
  // Most admin mutations now invalidate server-side via invalidateAll().
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
    if (submitting) return
    setSubmitting(true)
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
    } finally {
      setSubmitting(false)
    }
  }

  const handleHeroDelete = async (id: string) => {
    if (deletingId) return
    const hero = heroImages.find(h => h.id === id)
    setDeleteConfirm({ id, type: 'hero', label: hero?.title || 'this hero image' })
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
    if (submitting) return
    setSubmitting(true)
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
    } finally {
      setSubmitting(false)
    }
  }

  const handleCollectionDelete = async (id: string) => {
    if (deletingId) return
    const c = collections.find(c => c.id === id)
    setDeleteConfirm({ id, type: 'collection', label: c?.title || 'this collection' })
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
    if (submitting) return
    setSubmitting(true)
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
    } finally {
      setSubmitting(false)
    }
  }

  const handleTestimonialDelete = async (id: string) => {
    if (deletingId) return
    const t = testimonials.find(t => t.id === id)
    setDeleteConfirm({ id, type: 'testimonial', label: t?.customer_name || 'this testimonial' })
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

  const openAnnouncementEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setAnnouncementForm({
      text: announcement.text,
      link: announcement.link,
      link_text: announcement.link_text,
      icon: announcement.icon,
      display_order: announcement.display_order,
      is_active: announcement.is_active
    })
    setAnnouncementModal(true)
  }

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
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
    } finally {
      setSubmitting(false)
    }
  }

  const handleAnnouncementDelete = async (id: string) => {
    if (deletingId) return
    setDeleteConfirm({ id, type: 'announcement', label: 'this announcement' })
  }

  // Homepage Section Helpers
  const getSection = (key: string): HomepageSection | undefined =>
    homepageSections.find(s => s.section_key === key)

  const saveSection = async (sectionData: any) => {
    setSectionSaving(true)
    // Optimistic update
    setHomepageSections(prev => prev.map(s => s.id === sectionData.id ? { ...s, ...sectionData } : s))

    try {
      await api.put('/homepage-sections', sectionData)
      toast.success('Section saved')
      await loadData(true)
    } catch {
      toast.error('Failed to save section')
      await loadData(true) // Rollback or refresh
    } finally {
      setSectionSaving(false)
    }
  }

  const executeDelete = async () => {
    if (!deleteConfirm || deletingId) return
    const { id, type } = deleteConfirm
    setDeletingId(id)
    try {
      const endpointMap: Record<string, string> = {
        hero: '/hero-images',
        collection: '/featured-collections',
        testimonial: '/testimonials',
        announcement: '/announcements',
      }
      await api.del(`${endpointMap[type]}?id=${id}`)
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`)
      setDeleteConfirm(null)
      loadData()
    } catch {
      toast.error(`Failed to delete ${type}`)
    } finally {
      setDeletingId(null)
    }
  }

  // ── Layout helpers ─────────────────────────────────────────────────
  // Video sections in the DB
  const videoSections = useMemo(() => {
    return (homepageSections || []).filter(s => s.section_key === 'feature_video').sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
  }, [homepageSections])

  // Build the sortable layout items — hero is always first but not in sortable context
  const sortableLayout = useMemo(() => layout.filter(id => id !== 'hero'), [layout])

  // Available sections not currently in the layout (excluding feature_video which has special handling)
  const hiddenSections = useMemo(() => {
    return ALL_HOMEPAGE_SECTIONS.filter(s => s !== 'hero' && s !== 'feature_video' && !layout.includes(s))
  }, [layout])

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



  const handleDragEndLayout = (event: any) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setLayout(prev => {
        const withoutHero = prev.filter(id => id !== 'hero')
        const oldIndex = withoutHero.indexOf(active.id)
        const newIndex = withoutHero.indexOf(over.id)
        if (oldIndex === -1 || newIndex === -1) return prev
        const reordered = arrayMove(withoutHero, oldIndex, newIndex)
        return ['hero', ...reordered]
      })
    }
  }

  const addSectionToLayout = (sectionId: string) => {
    if (!layout.includes(sectionId)) {
      setLayout(prev => [...prev, sectionId])
    }
  }

  const removeSectionFromLayout = (sectionId: string) => {
    if (sectionId === 'hero') return // can't remove hero
    setLayout(prev => prev.filter(id => id !== sectionId))
  }

  const addVideoSection = async () => {
    const maxOrder = videoSections.length > 0
      ? Math.max(...videoSections.map((s: any) => s.display_order ?? 0))
      : -1
    const nextOrder = maxOrder + 1
    try {
      await api.post('/homepage-sections', {
        section_key: 'feature_video',
        title: 'ATELIER',
        cta_text: 'Shop Collection',
        cta_link: '/products',
        display_order: nextOrder,
        is_active: true,
        metadata: { text_color: '#FFFFFF', cta_color: '#FFFFFF' },
      })
      // Add to layout
      const videoId = nextOrder === 0 ? 'feature_video' : `feature_video:${nextOrder}`
      setLayout(prev => [...prev, videoId])
      toast.success('Video section added')
      await loadData(true)
    } catch {
      toast.error('Failed to add video section')
    }
  }

  const deleteVideoSection = async (sectionId: string, layoutKey: string) => {
    try {
      await api.del(`/homepage-sections?id=${sectionId}`)
      setLayout(prev => prev.filter(id => id !== layoutKey))
      toast.success('Video section removed')
      await loadData(true)
    } catch {
      toast.error('Failed to remove video section')
    }
  }

  const saveLayout = async () => {
    setLayoutSaving(true)
    try {
      await api.put('/site-config', { homepage_layout: layout })
      toast.success('Layout saved — frontend will update shortly')
    } catch {
      toast.error('Failed to save layout')
    }
    setLayoutSaving(false)
  }

  const tabs = [
    { id: 'layout' as const, label: 'Layout' },
    { id: 'hero' as const, label: 'Hero Images', count: heroImages.length },
    { id: 'feature_video' as const, label: 'Feature Video', count: videoSections.length },
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
      {/* Tabs — scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 admin-scrollbar">
        <div className="flex gap-1 border-b border-[#1a1a1a] min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-2.5 text-[13px] font-medium transition-colors relative whitespace-nowrap ${activeTab === tab.id
                ? 'text-white'
                : 'text-[#666] hover:text-white'
                }`}
            >
              {tab.label}
              {'count' in tab && typeof tab.count === 'number' && (
                <span className="ml-1.5 text-[11px] text-[#666]">({tab.count})</span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Layout Tab */}
      {activeTab === 'layout' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#888] text-sm">Drag sections to reorder how they appear on the homepage. Hero is always first.</p>
            </div>
            <button
              onClick={saveLayout}
              disabled={layoutSaving}
              className="admin-btn admin-btn-primary disabled:opacity-50"
            >
              {layoutSaving ? 'Saving...' : 'Save Layout'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Active Layout — left side */}
            <div className="lg:col-span-3">
              <h3 className="text-white text-sm font-semibold mb-3">Active Layout Order</h3>

              {/* Pinned hero card */}
              <SortableLayoutCard id="hero" isPinned />

              {/* Sortable sections */}
              <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEndLayout}>
                <SortableContext items={sortableLayout} strategy={verticalListSortingStrategy}>
                  {sortableLayout.map((id) => (
                    <SortableLayoutCard key={id} id={id} onRemove={removeSectionFromLayout} />
                  ))}
                </SortableContext>
              </DndContext>

              {sortableLayout.length === 0 && (
                <div className="text-center text-[#555] border border-dashed border-[#1a1a1a] rounded-xl p-8 mt-2">
                  No sections added yet. Add sections from the right.
                </div>
              )}
            </div>

            {/* Hidden sections + Add video — right side */}
            <div className="lg:col-span-2">
              <h3 className="text-white text-sm font-semibold mb-3">Available Sections</h3>
              <div className="space-y-2">
                {hiddenSections.map(id => {
                  const meta = SECTION_META[id] || { icon: '📄', label: id.replace(/_/g, ' '), description: '' }
                  return (
                    <div key={id} className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
                      <span className="text-lg">{meta.icon}</span>
                      <span className="text-[#888] text-sm flex-1">{meta.label}</span>
                      <button
                        onClick={() => addSectionToLayout(id)}
                        className="px-3 py-1 bg-[#262626] text-white text-xs rounded hover:bg-[#333] transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Feature Video — special add button */}
              <div className="mt-6">
                <h3 className="text-white text-sm font-semibold mb-3">Video Sections</h3>
                <p className="text-[#666] text-xs mb-3">Add multiple full-screen video sections and place them anywhere in the layout.</p>
                <div className="space-y-2">
                  {videoSections.map((vs: any, idx: number) => {
                    const layoutKey = idx === 0 ? 'feature_video' : `feature_video:${vs.display_order}`
                    const isInLayout = layout.includes(layoutKey)
                    return (
                      <div key={vs.id} className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
                        <span className="text-lg">🎬</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{vs.title || `Video #${idx + 1}`}</p>
                          <p className="text-[#555] text-xs">{isInLayout ? 'In layout' : 'Not in layout'}</p>
                        </div>
                        {!isInLayout ? (
                          <button
                            onClick={() => addSectionToLayout(layoutKey)}
                            className="px-3 py-1 bg-[#262626] text-white text-xs rounded hover:bg-[#333]"
                          >
                            + Add
                          </button>
                        ) : (
                          <span className="text-[10px] text-green-500 uppercase tracking-wider">Active</span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={addVideoSection}
                  className="mt-3 w-full px-4 py-2.5 border border-dashed border-[#333] rounded-xl text-[#888] text-sm hover:border-[#555] hover:text-white transition-colors"
                >
                  + Add Another Video Section
                </button>
              </div>

              {hiddenSections.length === 0 && videoSections.length === 0 && (
                <p className="text-[#555] text-sm">All sections are in the active layout.</p>
              )}
            </div>
          </div>
        </div>
      )}

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
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 hover:border-[#333] transition-colors"
              >
                <div className="relative w-full sm:w-48 h-40 sm:h-28 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0 border border-[#1a1a1a]">
                  <Image src={hero.image_url} alt={hero.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate">{hero.title}</h3>
                      <p className="text-[#888] text-sm truncate">{hero.subtitle}</p>
                      {hero.cta_text && (
                        <p className="text-[#666] text-xs mt-2">
                          CTA: {hero.cta_text} †’ {hero.cta_link}
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
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 sm:p-6 space-y-5 mt-6">
            <h3 className="text-white text-sm font-semibold">Dark Overlay Settings</h3>
            <p className="text-[#666] text-xs">Controls the dark overlay on top of hero images to ensure text readability.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
                return <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(${r},${g},${b},${heroOverlay.gradient_from / 100}), transparent, rgba(${r},${g},${b},${heroOverlay.gradient_to / 100}))` }} />
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

      {/* Feature Video Tab — now supports multiple video sections */}
      {activeTab === 'feature_video' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-[#888] text-sm">Manage full-screen background video sections. You can add multiple and place them anywhere in the layout.</p>
            <button
              onClick={addVideoSection}
              className="admin-btn admin-btn-primary"
            >
              {Icons.plus}
              <span>Add Video Section</span>
            </button>
          </div>

          {videoSections.length === 0 && (
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-12 text-center text-[#666]">
              No video sections yet. Add one to get started.
            </div>
          )}

          {videoSections.map((vs: any, idx: number) => {
            const layoutKey = idx === 0 ? 'feature_video' : `feature_video:${vs.display_order}`
            return (
              <div key={vs.id} className="relative">
                <div className="absolute -top-2 -right-2 z-10 flex gap-1">
                  {videoSections.length > 1 && (
                    <button
                      onClick={() => deleteVideoSection(vs.id, layoutKey)}
                      className="w-7 h-7 flex items-center justify-center bg-red-900/80 hover:bg-red-800 rounded-full text-white text-xs transition-colors shadow-lg"
                      title="Delete this video section"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="mb-2">
                  <span className="text-[#C9A96E] text-[11px] uppercase tracking-wider font-medium">Video Section #{idx + 1}</span>
                </div>
                <FeatureVideoTab
                  data={vs}
                  sectionSaving={sectionSaving}
                  saveSection={saveSection}
                />
              </div>
            )
          })}
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
              ðŸ’¡ Each collection links to a filtered product page. Set the <strong>Link</strong> field to <code className="bg-blue-900/40 px-1 rounded">/products?category=rings</code> (use lowercase category name).
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
                    <span className="text-[11px] text-[#666]">†’ {collection.link}</span>
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
                  {a.icon === 'gift' ? 'ðŸŽ' : a.icon === 'clock' ? '°' : a.icon === 'star' ? '­' : 'œ¨'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{a.text}</p>
                  {a.link && <p className="text-[#666] text-xs mt-1">{a.link_text || 'Link'} †’ {a.link}</p>}
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
                      {icon === 'gift' ? 'ðŸŽ' : icon === 'clock' ? '°' : icon === 'star' ? '­' : 'œ¨'} {icon}
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 admin-modal-overlay z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => !deletingId && setDeleteConfirm(null)}>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-t-2xl sm:rounded-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </div>
              <h3 className="text-white text-base font-semibold mb-2">Delete {deleteConfirm.type}</h3>
              <p className="text-[#888] text-sm">
                Are you sure you want to delete &ldquo;{deleteConfirm.label}&rdquo;? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button type="button" onClick={() => setDeleteConfirm(null)} disabled={!!deletingId} className="admin-btn admin-btn-secondary disabled:opacity-50">Cancel</button>
              <button onClick={executeDelete} disabled={!!deletingId} className="admin-btn admin-btn-danger disabled:opacity-50">
                {deletingId ? 'Deleting...' : 'Delete'}
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
              œ•
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
                œ• Remove
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
              œ•
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
            <p className="text-[#555] text-[11px] mt-1">Shows &quot;Only X pieces worldwide&quot;</p>
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

export default function AdminHomepageClientPage() {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <AdminLayout title="Homepage" subtitle="Customize your storefront">
          <HomepageContent />
        </AdminLayout>
      </ToastProvider>
    </AdminAuthProvider>
  )
}
