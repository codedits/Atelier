import { supabase } from './supabase'

export interface ThemeColors {
    primary: string
    secondary: string
    accent: string
    text: string
    text_light: string
}

export interface NavMenuItem {
    id: string
    label: string
    href: string
}

export interface SiteConfig {
    id: string
    theme_colors: ThemeColors
    typography: unknown
    features: any
    homepage_layout: string[]
    nav_menu: NavMenuItem[]
    updated_at: string
}

let cachedConfig: SiteConfig | null = null
let cachedAt = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
let fetchPromise: Promise<SiteConfig | null> | null = null

export async function getSiteConfig(): Promise<SiteConfig | null> {
    // If cached and still fresh, return it
    if (cachedConfig && Date.now() - cachedAt < CACHE_TTL) return cachedConfig

    // If a fetch is already in progress, wait for it
    if (fetchPromise) return fetchPromise

    fetchPromise = (async () => {
        try {
            const { data, error } = await supabase
                .from('site_config')
                .select('*')
                .single()

            if (error) {
                console.error('Error fetching site config:', error)
                return null
            }

            cachedConfig = data as SiteConfig
            cachedAt = Date.now()
            return cachedConfig
        } catch (e) {
            console.error('Unexpected error fetching site config:', e)
            return null
        } finally {
            // Always clear the promise so subsequent calls can refetch after TTL expires
            fetchPromise = null
        }
    })()

    return fetchPromise
}

export function clearSiteConfigCache() {
    cachedConfig = null
    fetchPromise = null
}
