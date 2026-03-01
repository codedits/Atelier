'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
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

// Generate column-based positions for images (4 columns)
function generateGridPositions(count: number) {
    const positions: { top: string; left: string; width: string; mobileWidth: string; speed: number; zIndex: number; opacity: number; blur: string }[] = []
    
    // Config for each column to create varied movement
    const columns = [
        { left: '5%',   speed: 0.6, zIndex: 1 },  // Col 1
        { left: '30%',  speed: 1.2, zIndex: 3 },  // Col 2 (Fast/Foreground)
        { left: '55%',  speed: 0.8, zIndex: 2 },  // Col 3
        { left: '80%',  speed: 0.4, zIndex: 0 },  // Col 4 (Slow/Background)
    ]

    for (let i = 0; i < count; i++) {
        const colIndex = i % 4
        const col = columns[colIndex]
        
        // Distribute images vertically with significant spacing
        // Base top position plus a vertical offset within the 500vh container
        const row = Math.floor(i / 4)
        const topOffset = 5 + (row * 25) + (seededRandom(i) * 10)
        
        positions.push({
            top: `${topOffset}%`,
            left: col.left,
            width: colIndex === 1 ? '22vw' : colIndex === 3 ? '15vw' : '18vw',
            mobileWidth: '42vw',
            speed: col.speed,
            zIndex: col.zIndex,
            opacity: col.zIndex === 0 ? 0.6 : 1,
            blur: col.zIndex === 0 ? '2px' : '0px',
        })
    }
    return positions
}

export default function Lookbook({ images = [], title = "THE LOOK", subtitle = "Discover" }: LookbookProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { ref: sectionRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 }) as { ref: any; isIntersecting: boolean }
    const localRef = useRef<HTMLElement>(null)
    const imageElementsRef = useRef<(HTMLDivElement | null)[]>([])
    const rafRef = useRef<number>(0)
    const [isMobile, setIsMobile] = useState(false)

    // Detect mobile for responsive scatter widths
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 768px)')
        setIsMobile(mq.matches)
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [])

    useEffect(() => {
        if (localRef.current) {
            if (typeof sectionRef === 'function') {
                sectionRef(localRef.current)
            } else if (sectionRef) {
                (sectionRef as React.MutableRefObject<HTMLElement | null>).current = localRef.current
            }
        }
    }, [sectionRef])

    // Memoize positions for the new grid layout
    const positions = useMemo(() => generateGridPositions(images.length), [images.length])

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

                // Write transforms directly to each image element — no state updates
                // We add an extra offset to columns to make them feel "untethered"
                imageElementsRef.current.forEach((el, i) => {
                    if (!el) return
                    const pos = positions[i]
                    if (!pos) return
                    el.style.transform = `translateY(${-scrollVal * pos.speed}px)`
                })
            })
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        onScroll() // initial calc

        return () => {
            window.removeEventListener('scroll', onScroll)
            cancelAnimationFrame(rafRef.current)
        }
    }, [images, positions])

    if (!images || images.length === 0) {
        return null
    }

    return (
        <section
            ref={(node) => {
                (localRef as any).current = node
                ;(containerRef as any).current = node
            }}
            className="relative w-full h-[500vh] bg-[#FAF9F6]"
            aria-label={`${subtitle} — ${title}`}
        >
            {/* Sticky Text Container */}
            <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pointer-events-none z-20">
                <div
                    className={cn(
                        "text-center transition-all duration-1000 transform",
                        isIntersecting ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    )}
                >
                    <span className="text-[12px] md:text-[14px] uppercase tracking-[0.4em] text-[#1A1A1A] font-medium mb-4 md:mb-6 block drop-shadow-sm">
                        {subtitle}
                    </span>
                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif text-[#1A1A1A] tracking-widest drop-shadow-md">
                        {title}
                    </h2>
                </div>
            </div>

            {/* Structured Column Container */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                {images.map((img, index) => {
                    const pos = positions[index]
                    if (!pos) return null

                    // Mobile adjustment: distribute into 2 columns instead of 4
                    const mobileAdjustedPos = isMobile ? {
                        ...pos,
                        left: (index % 2 === 0) ? '5%' : '53%',
                        top: `${2 + (Math.floor(index / 2) * 20) + (seededRandom(index) * 5)}%`,
                        width: '42vw'
                    } : pos

                    const imageContent = (
                        <>
                            <Image
                                src={img.image_url}
                                alt={img.title || `Lookbook image ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes={isMobile ? '45vw' : '25vw'}
                                loading={index < 6 ? 'eager' : 'lazy'}
                            />
                            {img.title && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                            className="absolute shadow-xl will-change-transform"
                            style={{
                                top: mobileAdjustedPos.top,
                                left: mobileAdjustedPos.left,
                                width: mobileAdjustedPos.width,
                                zIndex: mobileAdjustedPos.zIndex,
                                opacity: mobileAdjustedPos.opacity,
                                filter: `blur(${mobileAdjustedPos.blur})`,
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
