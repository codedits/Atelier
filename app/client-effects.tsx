'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Lenis from 'lenis'

export default function AppClientEffects() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1,
      infinite: false,
    })

    let destroyed = false

    function raf(time: number) {
      lenis.raf(time)
      if (!destroyed) {
        requestAnimationFrame(raf)
      }
    }

    requestAnimationFrame(raf)

    return () => {
      destroyed = true
      lenis.destroy()
    }
  }, [])

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