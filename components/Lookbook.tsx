/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

// Seeded pseudo-random for deterministic scatter
function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

interface LookbookProps {
    images?: { id: string; image_url: string; title?: string; subtitle?: string; link?: string }[]
    title?: string
    subtitle?: string
}

interface GridPosition {
    top: string
    left: string
    width: string
    speed: number
    zIndex: number
    opacity: number
    blur: string
    // Mobile overrides (applied via CSS media query)
    mobileTop: string
    mobileLeft: string
    mobileWidth: string
}

// Generate column-based positions for both desktop and mobile
function generateGridPositions(count: number): GridPosition[] {
    const positions: GridPosition[] = []

    // Desktop: 4 columns
    const columns = [
        { left: '2%', width: '18vw', speed: 0.7, zIndex: 1 },
        { left: '22%', width: '30vw', speed: 1.3, zIndex: 3 },
        { left: '55%', width: '24vw', speed: 0.9, zIndex: 2 },
        { left: '82%', width: '15vw', speed: 0.5, zIndex: 0 },
    ]

    for (let i = 0; i < count; i++) {
        const colIndex = i % 4
        const col = columns[colIndex]
        const row = Math.floor(i / 4)
        const topOffset = 3 + (row * 24) + (seededRandom(i) * 15)

        // Mobile: 2 columns
        const isEven = i % 2 === 0
        const mobileRow = Math.floor(i / 2)
        const mobileWidth = isEven
            ? (mobileRow % 2 === 0 ? '55vw' : '40vw')
            : (mobileRow % 2 === 0 ? '38vw' : '50vw')
        const mobileLeft = isEven ? '3%' : (mobileRow % 2 === 0 ? '58%' : '47%')
        const mobileTop = `${4 + (mobileRow * 18) + (seededRandom(i) * 12)}%`

        positions.push({
            top: `${topOffset}%`,
            left: col.left,
            width: col.width,
            speed: col.speed,
            zIndex: col.zIndex,
            opacity: col.zIndex === 0 ? 0.8 : 1,
            blur: col.zIndex === 0 ? '1px' : '0px',
            mobileTop,
            mobileLeft,
            mobileWidth,
        })
    }
    return positions
}

export default function Lookbook({ images = [], title = "THE LOOK", subtitle = "Discover" }: LookbookProps) {
    const displayTitle = title || "THE LOOK"
    const displaySubtitle = subtitle || "Discover"

    const containerRef = useRef<HTMLDivElement>(null)
    const { ref: sectionRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })
    const imageElementsRef = useRef<(HTMLDivElement | null)[]>([])
    const rafRef = useRef<number>(0)

    // Memoize positions — deterministic for both server and client
    const positions = useMemo(() => generateGridPositions(images.length), [images.length])

    // Generate a unique CSS class name per instance to scope the styles
    const styleId = useMemo(() => `lookbook-${Math.random().toString(36).slice(2, 8)}`, [])

    // Use rAF-based parallax that writes directly to DOM — zero re-renders
    useEffect(() => {
        if (!images || images.length === 0) return

        const onScroll = () => {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = requestAnimationFrame(() => {
                const container = containerRef.current
                if (!container) return

                const rect = container.getBoundingClientRect()
                if (rect.top >= window.innerHeight || rect.bottom <= 0) return

                const totalScrollable = rect.height + window.innerHeight
                const scrolled = window.innerHeight - rect.top
                const progress = Math.max(0, Math.min(1, scrolled / totalScrollable))
                const scrollVal = progress * 1000

                imageElementsRef.current.forEach((el, i) => {
                    if (!el) return
                    const pos = positions[i]
                    if (!pos) return
                    el.style.transform = `translateY(${-scrollVal * pos.speed}px)`
                })
            })
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll()

        return () => {
            window.removeEventListener('scroll', onScroll)
            cancelAnimationFrame(rafRef.current)
        }
    }, [images, positions])

    if (!images || images.length === 0) {
        return null
    }

    // Build responsive CSS rules using media queries — no JS state needed
    const responsiveStyles = positions.map((pos, i) => `
        .${styleId}-img-${i} {
            top: ${pos.mobileTop};
            left: ${pos.mobileLeft};
            width: ${pos.mobileWidth};
        }
        @media (min-width: 768px) {
            .${styleId}-img-${i} {
                top: ${pos.top};
                left: ${pos.left};
                width: ${pos.width};
            }
        }
    `).join('\n')

    return (
        <section
            ref={(node) => {
                (sectionRef as React.MutableRefObject<HTMLElement | null>).current = node;
                (containerRef as React.MutableRefObject<HTMLElement | null>).current = node;
            }}
            className="relative w-full h-[450vh] md:h-[500vh] bg-[#FAF9F6]"
            aria-label={`${subtitle} — ${title}`}
        >
            {/* Inject responsive positioning via CSS — prevents SSR/CSR mismatch */}
            <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />

            {/* Sticky Text Container */}
            <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pointer-events-none z-20">
                <div
                    className={cn(
                        "text-center transition-all duration-1000 transform",
                        isIntersecting ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    )}
                >
                    <span className="text-[12px] md:text-[14px] uppercase tracking-[0.4em] text-[#1A1A1A] font-medium mb-4 md:mb-6 block drop-shadow-sm">
                        {displaySubtitle}
                    </span>
                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif text-[#1A1A1A] tracking-widest drop-shadow-md">
                        {displayTitle}
                    </h2>
                </div>
            </div>

            {/* Structured Column Container */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                {images.map((img, index) => {
                    const pos = positions[index]
                    if (!pos) return null

                    const imageContent = (
                        <>
                            <Image
                                src={img.image_url}
                                alt={img.title || `Lookbook image ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 768px) 45vw, 25vw"
                                loading={index < 6 ? 'eager' : 'lazy'}
                            />
                            {img.title && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                                    <h3 className="text-white font-serif text-lg md:text-xl mb-1 text-center px-4">{img.title}</h3>
                                    {img.subtitle && <p className="text-white/80 text-[10px] md:text-sm uppercase tracking-widest text-center px-4">{img.subtitle}</p>}
                                </div>
                            )}
                        </>
                    )

                    return (
                        <div
                            key={img.id || index}
                            ref={(el) => { imageElementsRef.current[index] = el }}
                            className={`absolute shadow-xl will-change-transform ${styleId}-img-${index}`}
                            style={{
                                zIndex: pos.zIndex,
                                opacity: pos.opacity,
                                filter: `blur(${pos.blur})`,
                            }}
                        >
                            <div className="relative w-full pt-[125%] overflow-hidden bg-[#E8E4DF] group pointer-events-auto cursor-pointer rounded-sm">
                                {img.link ? (
                                    <a href={img.link} className="absolute inset-0 z-10 block" aria-label={img.title || `View lookbook item ${index + 1}`}>
                                        {imageContent}
                                    </a>
                                ) : (
                                    imageContent
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
