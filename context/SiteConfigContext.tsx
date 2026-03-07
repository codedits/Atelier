'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react'
import { SiteConfig, getSiteConfig } from '@/lib/siteConfig'

interface SiteConfigContextType {
    config: SiteConfig | null
    isLoading: boolean
    refreshConfig: () => Promise<void>
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined)

// Default colors to avoid FOUC as much as possible, these match our tailwind config
const DEFAULT_COLORS = {
    primary: '#1A1A1A',
    secondary: '#FAFAF8',
    accent: '#D4AF37',
    text: '#1A1A1A',
    text_light: '#4A4A4A'
}

export function SiteConfigProvider({ children, initialConfig }: { children: ReactNode, initialConfig?: SiteConfig | null }) {
    const [config, setConfig] = useState<SiteConfig | null>(initialConfig || null)
    const [isLoading, setIsLoading] = useState(!initialConfig)

    const fetchConfig = useCallback(async () => {
        setIsLoading(true)
        const data = await getSiteConfig()
        if (data) {
            setConfig(data)
        }
        setIsLoading(false)
    }, [])

    // Only fetch client-side if no initial config was provided from SSR
    useEffect(() => {
        if (!initialConfig) {
            fetchConfig()
        }
    }, [initialConfig, fetchConfig])

    // CSS variable injection — only needed as a fallback when config changes
    // client-side (e.g. after admin updates). On first load, layout.tsx SSR
    // already renders the correct values on <html>, avoiding any flash.
    useEffect(() => {
        if (!config?.theme_colors) return
        const root = document.documentElement
        const colors = config.theme_colors

        root.style.setProperty('--color-primary', colors.primary || DEFAULT_COLORS.primary)
        root.style.setProperty('--color-secondary', colors.secondary || DEFAULT_COLORS.secondary)
        root.style.setProperty('--color-accent', colors.accent || DEFAULT_COLORS.accent)
        root.style.setProperty('--color-text', colors.text || DEFAULT_COLORS.text)
        root.style.setProperty('--color-text-light', colors.text_light || DEFAULT_COLORS.text_light)
    }, [config])

    const contextValue = useMemo(() => ({
        config, isLoading, refreshConfig: fetchConfig
    }), [config, isLoading, fetchConfig])

    return (
        <SiteConfigContext.Provider value={contextValue}>
            {children}
        </SiteConfigContext.Provider>
    )
}

export function useSiteConfig() {
    const context = useContext(SiteConfigContext)
    if (context === undefined) {
        throw new Error('useSiteConfig must be used within a SiteConfigProvider')
    }
    return context
}
