import { memo } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FeatureVideoProps {
    data?: {
        title?: string
        image_url?: string // Repurposed for video URL in this context based on schema
        cta_text?: string
        cta_link?: string
        is_active?: boolean
        metadata?: any
    }
}

const FeatureVideo = memo(function FeatureVideo({ data }: FeatureVideoProps) {
    // If explicitly disabled or data is missing entirely, don't render anything
    if (!data || data.is_active === false) return null

    // Don't render section if no video has been uploaded
    if (!data.image_url) return null

    const videoUrl = data.image_url
    const title = data?.title || 'ATELIER'
    const ctaText = data?.cta_text || 'Shop Collection'
    const ctaLink = data?.cta_link || '/products'

    // Custom colors from metadata
    const textColor = data?.metadata?.text_color || '#FFFFFF'
    const ctaColor = data?.metadata?.cta_color || '#FFFFFF'

    return (
        <section className="relative w-full h-[100vh] min-h-[600px] overflow-hidden flex items-center justify-center">
            {/* Background Video */}
            <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                src={videoUrl}
            />

            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full h-full pointer-events-none">
                <h2
                    className="text-white text-5xl md:text-7xl lg:text-7xl font-light tracking-[0.2em] mb-8 font-cormorant"
                    style={{ pointerEvents: 'auto', color: textColor }}
                >
                    {title}
                </h2>

                {ctaText && ctaLink && (
                    <div style={{ pointerEvents: 'auto' }}>
                        <Link
                            href={ctaLink}
                            className="group inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] hover:opacity-70 transition-opacity"
                            style={{ color: ctaColor }}
                        >
                            <span>{ctaText}</span>
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
})

export default FeatureVideo
