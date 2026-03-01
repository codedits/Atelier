'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Command } from 'cmdk'
import { supabase } from '@/lib/supabase'

export function CommandPalette() {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [products, setProducts] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Toggle the menu when ⌘K is pressed
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    // Fetch data on search
    useEffect(() => {
        if (!search || search.length < 2) {
            setProducts([])
            setOrders([])
            return
        }

        const fetchResults = async () => {
            setLoading(true)

            // Sanitize search input — escape PostgREST special characters
            const sanitized = search.replace(/[%_\\(),.]/g, c => `\\${c}`)

            const { data: pData } = await supabase
                .from('products')
                .select('id, name')
                .ilike('name', `%${sanitized}%`)
                .limit(5)

            // For orders, only use ilike on user_name (avoid injecting into .or filters)
            const { data: oData } = await supabase
                .from('orders')
                .select('id, user_name')
                .ilike('user_name', `%${sanitized}%`)
                .limit(5)

            setProducts(pData || [])
            setOrders(oData || [])
            setLoading(false)
        }

        const timeout = setTimeout(fetchResults, 300)
        return () => clearTimeout(timeout)
    }, [search])

    const runCommand = (command: () => void) => {
        setOpen(false)
        command()
    }

    // Workaround for hydration errors with Command.Dialog in some Next.js setups
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            // Style using Tailwind directly to override cmdk defaults if needed
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
        >
            <div
                // cmdk injects styles but we override them with tailwind
                className="w-full max-w-xl bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl overflow-hidden flex flex-col"
                style={{ height: 'auto', maxHeight: '60vh' }}
            >
                <div className="flex items-center px-4 border-b border-[#333]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <Command.Input
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search products, orders, or pages..."
                        className="w-full bg-transparent px-3 py-4 text-white text-base outline-none placeholder:text-[#666]"
                        style={{ border: 'none', boxShadow: 'none' }}
                    />
                </div>

                <Command.List className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                    {loading && <Command.Loading className="p-4 text-sm text-[#666] text-center">Searching database...</Command.Loading>}

                    <Command.Empty className="p-6 text-sm text-[#666] text-center">No results found for &quot;{search}&quot;</Command.Empty>

                    <Command.Group heading="Pages" className="px-2 py-2 text-xs font-semibold text-[#888] mb-2 [&_[cmdk-item]]:mt-1 [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-2">
                        <Command.Item onSelect={() => runCommand(() => router.push('/admin/dashboard'))} className="px-3 py-2 text-sm text-white hover:bg-[#262626] aria-selected:bg-[#262626] rounded cursor-pointer outline-none transition-colors">
                            Dashboard Overview
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => router.push('/admin/products'))} className="px-3 py-2 text-sm text-white hover:bg-[#262626] aria-selected:bg-[#262626] rounded cursor-pointer outline-none transition-colors">
                            Manage Products
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => router.push('/admin/orders'))} className="px-3 py-2 text-sm text-white hover:bg-[#262626] aria-selected:bg-[#262626] rounded cursor-pointer outline-none transition-colors">
                            View Orders
                        </Command.Item>
                        <Command.Item onSelect={() => runCommand(() => router.push('/admin/builder'))} className="px-3 py-2 text-sm text-white hover:bg-[#262626] aria-selected:bg-[#262626] rounded cursor-pointer outline-none transition-colors">
                            Visual Layout Builder
                        </Command.Item>
                    </Command.Group>

                    {products.length > 0 && (
                        <Command.Group heading="Products" className="px-2 py-2 border-t border-[#333] text-xs font-semibold text-[#888] mb-2 [&_[cmdk-item]]:mt-1 [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-2">
                            {products.map(p => (
                                <Command.Item
                                    key={p.id}
                                    onSelect={() => runCommand(() => router.push(`/admin/products?edit=${p.id}`))}
                                    className="px-3 py-2 text-sm text-white hover:bg-[#262626] aria-selected:bg-[#262626] rounded cursor-pointer flex justify-between items-center outline-none transition-colors"
                                >
                                    <span>{p.name}</span>
                                    <span className="text-xs text-[#666] border border-[#333] px-1.5 py-0.5 rounded">Edit</span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}

                    {orders.length > 0 && (
                        <Command.Group heading="Orders" className="px-2 py-2 border-t border-[#333] text-xs font-semibold text-[#888] mb-2 [&_[cmdk-item]]:mt-1 [&_[cmdk-group-heading]]:mb-2 [&_[cmdk-group-heading]]:px-2">
                            {orders.map(o => (
                                <Command.Item
                                    key={o.id}
                                    onSelect={() => runCommand(() => router.push(`/admin/orders?id=${o.id}`))}
                                    className="px-3 py-2 text-sm text-[#ddd] hover:bg-[#262626] aria-selected:bg-[#262626] rounded cursor-pointer flex justify-between items-center outline-none transition-colors"
                                >
                                    <span>Order {o.id.split('-')[0]} • <span className="text-white">{o.user_name}</span></span>
                                    <span className="text-xs text-[#666] border border-[#333] px-1.5 py-0.5 rounded">View</span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}
                </Command.List>
                <div className="border-t border-[#333] p-3 flex items-center justify-between text-xs text-[#666]">
                    <span>Search powered by Supabase</span>
                    <div className="flex gap-2 items-center">
                        <span>Use</span>
                        <kbd className="px-1.5 py-0.5 bg-[#262626] text-[#888] rounded border border-[#444] font-sans">↑</kbd>
                        <kbd className="px-1.5 py-0.5 bg-[#262626] text-[#888] rounded border border-[#444] font-sans">↓</kbd>
                        <span>to navigate</span>
                        <kbd className="px-1.5 py-0.5 bg-[#262626] text-[#888] rounded border border-[#444] font-sans ml-2">↵</kbd>
                        <span>to select</span>
                    </div>
                </div>
            </div>
        </Command.Dialog>
    )
}
