'use client'

import { useState, useCallback, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { Header, Footer } from '@/components'
import { Product } from '@/lib/supabase'
import { Collection } from '@/app/admin/collections/AdminCollectionsClientPage'

interface CollectionClientPageProps {
    collection: Collection
    products: Product[]
}

const ProductGridItem = memo(function ProductGridItem({
    product,
    index
}: {
    product: Product
    index: number
}) {
    const [isHovered, setIsHovered] = useState(false)

    const secondaryImg = product.images && product.images.length > 1 ? product.images[1] : undefined

    const handleMouseEnter = useCallback(() => setIsHovered(true), [])
    const handleMouseLeave = useCallback(() => setIsHovered(false), [])

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
            style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
        >
            <Link href={`/products/${product.slug || product.id}`} className="block" prefetch={false}>
                <div className="relative aspect-[4/5] mb-5 overflow-hidden bg-[#F9F8F6]">
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className={`object-cover transition-all duration-700 ease-out ${isHovered && secondaryImg ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                            }`}
                        sizes="(min-width:1280px)25vw, (min-width:1024px)33vw, (min-width:640px)50vw, 100vw"
                        loading={index < 4 ? 'eager' : 'lazy'}
                    />

                    {secondaryImg && (
                        <Image
                            src={secondaryImg}
                            alt={`${product.name} - alternate view`}
                            fill
                            className={`object-cover transition-all duration-700 ease-out ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                                }`}
                            sizes="(min-width:1280px)25vw, (min-width:1024px)33vw, (min-width:640px)50vw, 100vw"
                        />
                    )}

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {product.old_price && (
                            <span className="bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest px-2.5 py-1">
                                Sale
                            </span>
                        )}
                        {product.stock === 0 && (
                            <span className="bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-[10px] uppercase tracking-widest px-2.5 py-1 border border-[#E8E4DF]">
                                Sold Out
                            </span>
                        )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <div className="w-full bg-white/90 backdrop-blur-md py-3 text-center text-[11px] uppercase tracking-[0.2em] font-medium text-[#1A1A1A] border border-[#E8E4DF]">
                            View Details
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A] font-medium">
                        {product.category}
                    </p>
                    <h3 className="font-serif text-lg text-[#1A1A1A] group-hover:text-[#888] transition-colors duration-300">
                        {product.name}
                    </h3>
                    <div className="flex items-center justify-center gap-3">
                        <p className="text-sm font-medium text-[#1A1A1A]">
                            ₨{product.price.toLocaleString()}
                        </p>
                        {product.old_price && (
                            <p className="text-sm text-[#AAA] line-through decoration-[#AAA]/50">
                                ₨{product.old_price.toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    )
})

export default function CollectionClientPage({ collection, products }: CollectionClientPageProps) {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main>
                {/* Cinematic Hero Banner */}
                <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
                    {collection.image_url ? (
                        <div className="absolute inset-0">
                            <Image
                                src={collection.image_url}
                                alt={collection.name}
                                fill
                                priority
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-[#1A1A1A]" />
                    )}

                    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <span className="text-white/80 text-[11px] uppercase tracking-[0.3em] font-medium mb-4 block">
                            Exclusive Collection
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.1] mb-6 drop-shadow-lg">
                            {collection.name}
                        </h1>
                        <div className="w-16 h-px bg-white/50 mx-auto mb-6" />
                        {collection.description && (
                            <p className="text-white/90 text-sm md:text-base md:text-lg max-w-2xl mx-auto leading-relaxed drop-shadow">
                                {collection.description}
                            </p>
                        )}
                    </div>
                </section>

                {/* Product Grid Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                        <div className="flex items-end justify-between mb-16 border-b border-[#E8E4DF] pb-6">
                            <h2 className="text-2xl font-serif text-[#1A1A1A]">
                                Curated Pieces
                            </h2>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-[#AAA]">
                                {products.length} {products.length === 1 ? 'Piece' : 'Pieces'}
                            </p>
                        </div>

                        <div className="min-h-[400px]">
                            {products.length > 0 ? (
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-12 sm:gap-y-16">
                                    {products.map((product, index) => (
                                        <ProductGridItem key={product.id} product={product} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-32 border border-dashed border-[#E8E4DF] bg-[#FAF9F6]">
                                    <h3 className="font-serif text-2xl text-[#1A1A1A] mb-4">No pieces available yet</h3>
                                    <p className="text-[#4A4A4A] text-sm">
                                        This collection is currently being curated. Check back soon for exclusive pieces.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
