'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface LookbookImageNode {
    id: string;
    image_url: string;
    title?: string;
    subtitle?: string;
    link?: string;
}

interface LookbookProps {
    images?: LookbookImageNode[]
    title?: string
    subtitle?: string
}

function LookbookItem({ img, index }: { img: LookbookImageNode, index: number }) {
    const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true })

    // Pinterest-style masonry logic using staggered aspect ratios based on index
    const aspectRatios = [
        "aspect-[3/4]",    // Vertical
        "aspect-square",   // Square
        "aspect-[4/5]",    // Slightly vertical
        "aspect-[2/3]",    // Tall vertical
        "aspect-[3/2]",    // Horizontal
        "aspect-[4/5]"     // Slightly vertical
    ]
    const aspectClass = aspectRatios[index % aspectRatios.length]

    const imageElement = (
        <div className={cn(
            "relative w-full overflow-hidden bg-[#F5F0EB] group rounded-sm transition-shadow duration-500 hover:shadow-xl cursor-pointer",
            aspectClass
        )}>
            <Image
                src={img.image_url}
                alt={img.title || `Lookbook Image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {/* Subtle overlay with text on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100">
                {img.subtitle && (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/90 mb-2 font-medium">
                        {img.subtitle}
                    </span>
                )}
                {img.title && (
                    <h3 className="text-lg md:text-xl font-serif text-white text-center leading-tight">
                        {img.title}
                    </h3>
                )}
                <div className="mt-4 w-8 h-px bg-white/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
        </div>
    )

    return (
        <div
            ref={ref as React.MutableRefObject<HTMLDivElement>}
            className={cn(
                "inline-block w-full break-inside-avoid mb-3 md:mb-6 transition-all duration-1000 ease-out will-change-transform",
                isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            )}
            style={{ transitionDelay: `${(index % 4) * 100}ms` }}
        >
            {img.link ? (
                <a href={img.link} className="block group">
                    {imageElement}
                </a>
            ) : (
                <div className="group">
                    {imageElement}
                </div>
            )}
        </div>
    )
}

export default function Lookbook({ images = [], title = "THE LOOK", subtitle = "Discover" }: LookbookProps) {
    const { ref: headerRef, isIntersecting: headerVisible } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true })

    if (!images || images.length === 0) {
        return null
    }

    return (
        <section className="bg-[#FAF9F6] py-12 md:py-20 px-4 sm:px-6 lg:px-8 w-full m-0" aria-label="Lookbook Pinterest Grid">
            <div className="max-w-[1440px] mx-auto">
                {/* Compact Header */}
                <div
                    ref={headerRef as React.MutableRefObject<HTMLDivElement>}
                    className={cn(
                        "text-center mb-10 md:mb-14 transition-all duration-1000 will-change-transform",
                        headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    )}
                >
                    <span className="text-[10px] md:text-[12px] uppercase tracking-[0.3em] text-[#C9A96E] font-semibold mb-2 block">
                        {subtitle}
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#1A1A1A] tracking-tight lowercase italic">
                        {title}
                    </h2>
                    <div className="w-12 h-px bg-[#1A1A1A]/10 mx-auto mt-6" />
                </div>

                {/* Pinterest Masonry Grid */}
                <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-6">
                    {images.map((img, index) => (
                        <LookbookItem key={img.id || index} img={img} index={index} />
                    ))}
                </div>

                {/* Minimal Footer */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-4 text-[#888]">
                        <span className="w-8 h-px bg-current opacity-20" />
                        <span className="text-[10px] uppercase tracking-[0.3em] font-medium italic">Atelier Editorial</span>
                        <span className="w-8 h-px bg-current opacity-20" />
                    </div>
                </div>
            </div>
        </section>
    )
}
