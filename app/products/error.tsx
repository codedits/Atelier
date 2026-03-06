'use client'

import { useEffect } from 'react'

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-[50vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h2 className="text-xl font-medium text-[#1A1A1A] mb-2">Could not load products</h2>
        <p className="text-[#666] text-sm mb-6">Something went wrong while loading this page.</p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[#1A1A1A] text-white text-sm rounded hover:bg-[#333] transition-colors"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
