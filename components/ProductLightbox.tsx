'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ProductLightboxProps {
  images: string[]
  initialIndex: number
  alt: string
  isOpen: boolean
  onClose: () => void
}

export function ProductLightbox({
  images,
  initialIndex,
  alt,
  isOpen,
  onClose,
}: ProductLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const panStart = useRef({ x: 0, y: 0 })
  const lastTouchDistance = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }, [currentIndex])

  useEffect(() => {
    if (!isOpen) return
    setCurrentIndex(initialIndex)
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }, [isOpen, initialIndex])

  useEffect(() => {
    if (!isOpen) return

    const preload = images.map((src) => {
      const img = new window.Image()
      img.src = src
      return img
    })

    return () => {
      preload.length = 0
    }
  }, [isOpen, images])

  useEffect(() => {
    if (!isOpen) return

    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
          break
        case 'ArrowRight':
          setCurrentIndex((prev) => (prev + 1) % images.length)
          break
        case '+':
        case '=':
          setZoomLevel((prev) => Math.min(prev + 0.5, 4))
          break
        case '-':
          setZoomLevel((prev) => Math.max(prev - 0.5, 1))
          break
      }
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, images.length, onClose])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoomLevel <= 1) return
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY }
    panStart.current = { ...panOffset }
  }, [zoomLevel, panOffset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setPanOffset({
      x: panStart.current.x + dx,
      y: panStart.current.y + dy,
    })
  }, [isDragging, zoomLevel])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if (zoomLevel <= 1) return
      setIsDragging(true)
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      panStart.current = { ...panOffset }
    } else if (e.touches.length === 2) {
      setIsDragging(false)
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      lastTouchDistance.current = distance
    }
  }, [zoomLevel, panOffset])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      const dx = e.touches[0].clientX - dragStart.current.x
      const dy = e.touches[0].clientY - dragStart.current.y
      setPanOffset({
        x: panStart.current.x + dx,
        y: panStart.current.y + dy,
      })
    } else if (e.touches.length === 2 && lastTouchDistance.current !== null) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )

      const delta = (distance - lastTouchDistance.current) / 100
      setZoomLevel((prev) => {
        const next = Math.max(1, Math.min(prev + delta * 1.5, 4))
        if (next <= 1) setPanOffset({ x: 0, y: 0 })
        return next
      })
      lastTouchDistance.current = distance
    }
  }, [isDragging, zoomLevel])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    lastTouchDistance.current = null
  }, [])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setZoomLevel(1)
      setPanOffset({ x: 0, y: 0 })
    } else {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left - rect.width / 2
      const clickY = e.clientY - rect.top - rect.height / 2
      setZoomLevel(2.5)
      setPanOffset({
        x: -clickX * 1.5,
        y: -clickY * 1.5,
      })
    }
  }, [zoomLevel])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.3 : 0.3
    setZoomLevel((prev) => {
      const next = Math.max(1, Math.min(prev + delta, 4))
      if (next <= 1) setPanOffset({ x: 0, y: 0 })
      return next
    })
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-200">
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <span className="text-white text-xs sm:text-sm font-semibold tracking-wider uppercase">
          {currentIndex + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-1 sm:px-2">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.5, 1))}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white/90 hover:text-white transition-colors"
              disabled={zoomLevel <= 1}
              aria-label="Zoom out"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-white text-[10px] sm:text-[11px] font-bold min-w-[44px] sm:min-w-[50px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.5, 4))}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white/90 hover:text-white transition-colors"
              disabled={zoomLevel >= 4}
              aria-label="Zoom in"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white text-black rounded-full hover:bg-neutral-200 transition-colors shadow-lg"
            aria-label="Close lightbox"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={cn(
          'flex-1 flex items-center justify-center overflow-hidden select-none touch-none',
          zoomLevel > 1 ? 'cursor-grab' : 'cursor-zoom-in',
          isDragging && 'cursor-grabbing'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          key={images[currentIndex]}
          src={images[currentIndex]}
          alt={`${alt} - view ${currentIndex + 1}`}
          className="w-full h-full object-contain object-center transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
            willChange: 'transform',
          }}
          draggable={false}
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full hover:bg-white hover:text-black transition-all text-white shadow-xl"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full hover:bg-white hover:text-black transition-all text-white shadow-xl"
            aria-label="Next image"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/70 to-transparent py-3 sm:py-4 px-3 sm:px-6">
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  'relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 overflow-hidden border-2 transition-all bg-white/5',
                  idx === currentIndex
                    ? 'border-white opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-80'
                )}
                aria-label={`Go to image ${idx + 1}`}
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-contain"
                  loading="lazy"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {zoomLevel <= 1 && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-50 text-white/70 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest pointer-events-none bg-black/25 backdrop-blur-sm px-3 sm:px-4 py-1 rounded-full whitespace-nowrap">
          Pinch or Scroll to zoom - Arrows to navigate
        </div>
      )}
    </div>
  )
}
