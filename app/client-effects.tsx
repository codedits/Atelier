'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function AppClientEffects() {
  const pathname = usePathname()
  const router = useRouter()
  const isStorefrontRoute =
    pathname === '/' ||
    pathname.startsWith('/products') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/favorites') ||
    pathname.startsWith('/checkout')

  useEffect(() => {
    if (!isStorefrontRoute) return

    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null
    let destroyed = false
    let rafId: number | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let idleId: number | null = null

    function raf(time: number) {
      if (!lenis) return
      lenis.raf(time)
      if (!destroyed) {
        rafId = requestAnimationFrame(raf)
      }
    }

    const initLenis = async () => {
      const { default: Lenis } = await import('lenis')
      if (destroyed) return

      lenis = new Lenis({
        lerp: 0.08,
        wheelMultiplier: 1,
        infinite: false,
      })

      rafId = requestAnimationFrame(raf)
    }

    if ('requestIdleCallback' in window) {
      const idle = (window as Window & {
        requestIdleCallback: (cb: () => void) => number
      }).requestIdleCallback
      idleId = idle(() => {
        void initLenis()
      })
    } else {
      timeoutId = globalThis.setTimeout(() => {
        void initLenis()
      }, 200)
    }

    return () => {
      destroyed = true
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId)
      }
      if (idleId !== null && 'cancelIdleCallback' in window) {
        const cancelIdle = (window as Window & {
          cancelIdleCallback: (id: number) => void
        }).cancelIdleCallback
        cancelIdle(idleId)
      }
      if (lenis) {
        lenis.destroy()
      }
    }
  }, [isStorefrontRoute])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  useEffect(() => {
    const criticalRoutes = ['/products', '/cart', '/favorites']

    const prefetchRoutes = () => {
      criticalRoutes.forEach((route) => router.prefetch(route))
    }

    if ('requestIdleCallback' in window) {
      const idle = (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback
      idle(prefetchRoutes)
      return
    }

    const timeout = globalThis.setTimeout(prefetchRoutes, 1000)
    return () => globalThis.clearTimeout(timeout)
  }, [router])

  return null
}