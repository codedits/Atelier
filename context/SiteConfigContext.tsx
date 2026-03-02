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

    // Effect to fetch config on mount if no initial config provided
    useEffect(() => {
        if (!initialConfig) {
            fetchConfig()
        }
    }, [initialConfig, fetchConfig])

    // Effect to inject CSS variables
    useEffect(() => {
        const root = document.documentElement
        const colors = config?.theme_colors || DEFAULT_COLORS

        // Convert hex to specific formats if needed, or just set raw vars
        // Assuming tailwind arbitrary values or custom CSS vars
        root.style.setProperty('--color-primary', colors.primary)
        root.style.setProperty('--color-secondary', colors.secondary)
        root.style.setProperty('--color-accent', colors.accent)
        root.style.setProperty('--color-text', colors.text)
        root.style.setProperty('--color-text-light', colors.text_light)

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
