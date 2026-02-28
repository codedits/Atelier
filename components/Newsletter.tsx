import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setMessage('Thank you for subscribing!')
        setEmail('')
      } else {
        const data = await res.json().catch(() => ({}))
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  const { ref: sectionRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })

  return (
    <section className="py-20 md:py-28 bg-white w-full overflow-hidden relative" ref={sectionRef}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #E8E4DF 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full mx-auto px-6 lg:px-8 max-w-2xl text-center">

        <div
          className={cn(
            "space-y-8 will-change-transform invisible-before-reveal",
            isIntersecting && "reveal-slide-up"
          )}
        >
          {/* Gold ornament */}
          <div className="luxury-divider mb-8">
            <div className="luxury-divider-diamond" />
          </div>

          <h2 className="text-4xl md:text-5xl font-medium text-[#1A1A1A] tracking-wide font-serif">
            Stay Inspired
          </h2>

          <p className="text-sm text-[#6B6B6B] max-w-md mx-auto leading-relaxed">
            Be the first to discover new collections, exclusive offers, and artisan stories.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10">
            <div className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                type="email"
                id="newsletter-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                aria-label="Email address for newsletter"
                className="flex-1 px-5 py-3.5 bg-[#FAF9F6] border border-[#E8E4DF] text-[#1A1A1A] placeholder-[#AAA] focus:outline-none focus:border-[#1A1A1A] transition-all text-sm tracking-wider"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-8 py-3.5 bg-[#1A1A1A] text-white whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-[#333] transition-all disabled:opacity-60"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {status === 'success' && (
              <p className="text-[11px] text-green-600 mt-3 tracking-wider">{message}</p>
            )}
            {status === 'error' && (
              <p className="text-[11px] text-red-500 mt-3 tracking-wider">{message}</p>
            )}
            {status === 'idle' && (
              <p className="text-[10px] text-[#AAA] mt-4 tracking-wider">
                By subscribing, you agree to our Privacy Policy.
              </p>
            )}
          </form>

        </div>

      </div>
    </section>
  )
}
