import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { ToastProvider, useToast } from '@/context/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'
import { useAdminApi } from '@/hooks/useAdminApi'
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

interface NavMenuItem {
    id: string
    label: string
    href: string
}

function SortableBlockItem({ id, label, isNav, onEdit, onDelete }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between p-5 mb-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl"
        >
            <div className="flex items-center gap-4">
                <div {...attributes} {...listeners} className="cursor-grab hover:text-white text-[#888] active:cursor-grabbing">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </div>
                <span className="text-white font-medium">{label}</span>
            </div>
            {isNav && (
                <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(id)} className="p-1 px-3 text-xs bg-[#262626] rounded text-white hover:bg-[#333]">Edit</button>
                    <button onClick={() => onDelete(id)} className="p-1 px-3 text-xs bg-red-900/30 text-red-400 rounded hover:bg-red-900/50">Delete</button>
                </div>
            )}
        </div>
    );
}

const ALL_HOMEPAGE_SECTIONS = [
    'hero', 'value_proposition', 'featured_collections', 'logo_marquee', 'collections_highlight',
    'process_steps', 'craftsmanship', 'new_arrivals', 'testimonials', 'instagram_gallery', 'newsletter'
]

function BuilderContent() {
    const { showToast, success, error: toastError } = useToast()
    const [activeTab, setActiveTab] = useState<'homepage' | 'nav' | 'theme' | 'content'>('homepage')
    const [layout, setLayout] = useState<string[]>([])
    const [navMenu, setNavMenu] = useState<NavMenuItem[]>([])
    const [themeColors, setThemeColors] = useState({ primary: '', secondary: '', accent: '' })
    const [features, setFeatures] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const api = useAdminApi()

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        loadConfig()
    }, [])

    const loadConfig = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('site_config').select('*').single()
        if (data) {
            setLayout(data.homepage_layout || ALL_HOMEPAGE_SECTIONS)
            setNavMenu(data.nav_menu || [])
            setThemeColors(data.theme_colors || { primary: '', secondary: '', accent: '' })
            setFeatures(data.features || {})
        } else {
            setLayout(ALL_HOMEPAGE_SECTIONS)
            setNavMenu([])
            setFeatures({})
        }
        setLoading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        const { error } = await supabase
            .from('site_config')
            .update({ homepage_layout: layout, nav_menu: navMenu, theme_colors: themeColors, features, updated_at: new Date() })
            .eq('id', '00000000-0000-4000-8000-000000000001')

        if (error) {
            toastError('Failed to save configuration')
        } else {
            // Bust the ISR cache so the frontend regenerates
            try {
                await api.post('/revalidate', { tag: 'site_config' })
            } catch (e) {
                console.warn('Revalidation failed, cache may be stale:', e)
            }
            success('Configuration saved — frontend will update shortly')
        }
        setSaving(false)
    }

    // --- Homepage layout ---
    const unselectedSections = ALL_HOMEPAGE_SECTIONS.filter(s => !layout.includes(s))

    const handleDragEndHomepage = (event: any) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setLayout((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    const toggleSection = (section: string) => {
        if (layout.includes(section)) {
            setLayout(layout.filter(s => s !== section))
        } else {
            setLayout([...layout, section])
        }
    }

    // --- Nav menu ---
    const handleDragEndNav = (event: any) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setNavMenu((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    // Inline nav item editing state
    const [editingNav, setEditingNav] = useState<{ id: string | null; label: string; href: string }>({ id: null, label: '', href: '' })
    const navLabelRef = useRef<HTMLInputElement>(null)

    const addNavItem = () => {
        setEditingNav({ id: '__new__', label: '', href: '' })
        setTimeout(() => navLabelRef.current?.focus(), 50)
    }

    const editNavItem = (id: string) => {
        const item = navMenu.find(i => i.id === id)
        if (!item) return
        setEditingNav({ id, label: item.label, href: item.href })
        setTimeout(() => navLabelRef.current?.focus(), 50)
    }

    const saveNavEdit = () => {
        if (!editingNav.label.trim() || !editingNav.href.trim()) return
        if (editingNav.id === '__new__') {
            setNavMenu([...navMenu, { id: Date.now().toString(), label: editingNav.label.trim(), href: editingNav.href.trim() }])
        } else if (editingNav.id) {
            setNavMenu(navMenu.map(i => i.id === editingNav.id ? { ...i, label: editingNav.label.trim(), href: editingNav.href.trim() } : i))
        }
        setEditingNav({ id: null, label: '', href: '' })
    }

    const cancelNavEdit = () => {
        setEditingNav({ id: null, label: '', href: '' })
    }

    if (loading) return <div className="text-white p-8">Loading builder...</div>

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-semibold text-white">Visual Layout Builder</h2>
                    <p className="text-[#888] mt-1 text-sm">Drag and drop sections to reorder how they appear to users.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-white text-black font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Layouts'}
                </button>
            </div>

            <div className="flex gap-4 mb-6 border-b border-[#1a1a1a]">
                <button
                    onClick={() => setActiveTab('homepage')}
                    className={`px-4 py-3 -mb-px text-sm font-medium border-b-2 ${activeTab === 'homepage' ? 'border-white text-white' : 'border-transparent text-[#888] hover:text-[#ccc]'}`}
                >
                    Homepage Blocks
                </button>
                <button
                    onClick={() => setActiveTab('nav')}
                    className={`px-4 py-3 -mb-px text-sm font-medium border-b-2 ${activeTab === 'nav' ? 'border-white text-white' : 'border-transparent text-[#888] hover:text-[#ccc]'}`}
                >
                    Navigation Menu
                </button>
                <button
                    onClick={() => setActiveTab('theme')}
                    className={`px-4 py-3 -mb-px text-sm font-medium border-b-2 ${activeTab === 'theme' ? 'border-white text-white' : 'border-transparent text-[#888] hover:text-[#ccc]'}`}
                >
                    Theme Settings
                </button>
                <button
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-3 -mb-px text-sm font-medium border-b-2 ${activeTab === 'content' ? 'border-white text-white' : 'border-transparent text-[#888] hover:text-[#ccc]'}`}
                >
                    Content Editor
                </button>
            </div>

            {activeTab === 'homepage' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-lg font-medium text-white mb-4">Active Layout Order</h3>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndHomepage}>
                            <SortableContext items={layout} strategy={verticalListSortingStrategy}>
                                {layout.map((id) => (
                                    <SortableBlockItem key={id} id={id} label={id.replace(/_/g, ' ').toUpperCase()} />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white mb-4">Hidden Sections</h3>
                        <div className="space-y-2">
                            {unselectedSections.length === 0 ? (
                                <p className="text-[#666] text-sm">All available sections are currently active.</p>
                            ) : unselectedSections.map(id => (
                                <div key={id} className="flex items-center justify-between p-5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl">
                                    <span className="text-[#888] font-medium">{id.replace(/_/g, ' ').toUpperCase()}</span>
                                    <button onClick={() => toggleSection(id)} className="px-3 py-1 bg-[#262626] text-white text-sm rounded">Add</button>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-lg font-medium text-white mt-12 mb-4">Remove Sections</h3>
                        <p className="text-sm text-[#888] mb-4">Click a section to remove it from the active layout.</p>
                        <div className="flex flex-wrap gap-2">
                            {layout.map(id => (
                                <button key={id} onClick={() => toggleSection(id)} className="px-3 py-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/50 rounded text-sm">
                                    Remove {id.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'nav' && (
                <div className="max-w-3xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white">Menu Links</h3>
                        <button onClick={addNavItem} className="px-3 py-1.5 bg-[#262626] text-white text-sm rounded hover:bg-[#333]">
                            + Add Link
                        </button>
                    </div>

                    {/* Inline add/edit form */}
                    {editingNav.id && (
                        <div className="p-4 mb-4 bg-[#0a0a0a] border border-[#333] rounded-2xl space-y-3">
                            <p className="text-sm font-medium text-white">{editingNav.id === '__new__' ? 'Add Link' : 'Edit Link'}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    ref={navLabelRef}
                                    type="text"
                                    placeholder="Label (e.g., Shop)"
                                    value={editingNav.label}
                                    onChange={e => setEditingNav({ ...editingNav, label: e.target.value })}
                                    onKeyDown={e => { if (e.key === 'Enter') saveNavEdit(); if (e.key === 'Escape') cancelNavEdit() }}
                                    className="admin-input w-full"
                                />
                                <input
                                    type="text"
                                    placeholder="URL (e.g., /products)"
                                    value={editingNav.href}
                                    onChange={e => setEditingNav({ ...editingNav, href: e.target.value })}
                                    onKeyDown={e => { if (e.key === 'Enter') saveNavEdit(); if (e.key === 'Escape') cancelNavEdit() }}
                                    className="admin-input w-full"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={saveNavEdit} disabled={!editingNav.label.trim() || !editingNav.href.trim()} className="px-3 py-1.5 bg-white text-black text-sm rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed">Save</button>
                                <button onClick={cancelNavEdit} className="px-3 py-1.5 bg-[#262626] text-white text-sm rounded hover:bg-[#333]">Cancel</button>
                            </div>
                        </div>
                    )}

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndNav}>
                        <SortableContext items={navMenu.map(n => n.id)} strategy={verticalListSortingStrategy}>
                            {navMenu.map((item) => (
                                <SortableBlockItem
                                    key={item.id}
                                    id={item.id}
                                    label={`${item.label} (${item.href})`}
                                    isNav
                                    onEdit={editNavItem}
                                    onDelete={(id: string) => setNavMenu(navMenu.filter(n => n.id !== id))}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {navMenu.length === 0 && (
                        <div className="p-8 text-center text-[#555] border border-dashed border-[#1a1a1a] rounded-2xl">
                            No links configured.
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'theme' && (
                <div className="max-w-xl space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#888] mb-2">Primary Color</label>
                        <input
                            type="color"
                            value={themeColors.primary}
                            onChange={e => setThemeColors({ ...themeColors, primary: e.target.value })}
                            className="w-full h-12 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl cursor-pointer"
                        />
                        <p className="text-xs text-[#555] mt-1">Foundational color for buttons, dark areas.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#888] mb-2">Secondary Color</label>
                        <input
                            type="color"
                            value={themeColors.secondary}
                            onChange={e => setThemeColors({ ...themeColors, secondary: e.target.value })}
                            className="w-full h-12 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl cursor-pointer"
                        />
                        <p className="text-xs text-[#555] mt-1">Background color for light areas (e.g. #FAFAF8).</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#888] mb-2">Accent Color</label>
                        <input
                            type="color"
                            value={themeColors.accent}
                            onChange={e => setThemeColors({ ...themeColors, accent: e.target.value })}
                            className="w-full h-12 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl cursor-pointer"
                        />
                        <p className="text-xs text-[#555] mt-1">Highlights and interactive states (e.g. gold).</p>
                    </div>
                </div>
            )}

            {activeTab === 'content' && (
                <div className="max-w-3xl space-y-8">

                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-2xl">
                        <h3 className="text-lg font-medium text-white mb-4">Value Proposition Content</h3>
                        <div className="space-y-6">
                            {(features?.value_proposition || []).map((val: any, index: number) => (
                                <div key={index} className="pl-4 border-l-2 border-[#1a1a1a] space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-white">Item {index + 1}</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-[#888] mb-1">Title</label>
                                            <input
                                                type="text"
                                                value={val.title || ''}
                                                onChange={e => {
                                                    const newVp = [...(features?.value_proposition || [])];
                                                    newVp[index] = { ...newVp[index], title: e.target.value };
                                                    setFeatures({ ...features, value_proposition: newVp })
                                                }}
                                                className="w-full bg-[#111] border border-[#1a1a1a] text-white px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-[#888] mb-1">Icon (truck, shield, gift, leaf)</label>
                                            <input
                                                type="text"
                                                value={val.icon || ''}
                                                onChange={e => {
                                                    const newVp = [...(features?.value_proposition || [])];
                                                    newVp[index] = { ...newVp[index], icon: e.target.value };
                                                    setFeatures({ ...features, value_proposition: newVp })
                                                }}
                                                className="w-full bg-[#111] border border-[#1a1a1a] text-white px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[#888] mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={val.description || ''}
                                            onChange={e => {
                                                const newVp = [...(features?.value_proposition || [])];
                                                newVp[index] = { ...newVp[index], description: e.target.value };
                                                setFeatures({ ...features, value_proposition: newVp })
                                            }}
                                            className="w-full bg-[#111] border border-[#1a1a1a] text-white px-4 py-2.5 text-sm rounded-lg focus:outline-none focus:border-white"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default function AdminBuilderPage() {
    return (
        <AdminAuthProvider>
            <ToastProvider>
                <AdminLayout title="Visual Builder" subtitle="Customize your site layout">
                    <Head>
                        <title>Builder | Atelier Admin</title>
                    </Head>
                    <BuilderContent />
                </AdminLayout>
            </ToastProvider>
        </AdminAuthProvider>
    )
}
