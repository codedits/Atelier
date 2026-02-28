import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import Image from 'next/image'

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
        setMessage('Welcome to the Atelier family.')
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
    <section className="w-full overflow-hidden bg-[#FAF9F6]" ref={sectionRef}>
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
        {/* Image side */}
        <div
          className={cn(
            "relative h-[300px] lg:h-auto overflow-hidden invisible-before-reveal",
            isIntersecting && "reveal-fade-in"
          )}
        >
          <Image
            src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1200&auto=format&fit=crop"
            alt="Luxury jewelry close-up"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Floating badge on image */}
          <div className="absolute bottom-8 left-8 right-8 lg:bottom-12 lg:left-12">
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm px-5 py-3">
              <svg className="w-4 h-4 text-[#C9A96E]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A] font-medium">
                Exclusive access for subscribers
              </span>
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="flex items-center justify-center py-16 md:py-20 lg:py-0 px-8 md:px-12 lg:px-16">
          <div
            className={cn(
              "max-w-md w-full space-y-10 invisible-before-reveal",
              isIntersecting && "reveal-slide-up"
            )}
            style={{ animationDelay: '150ms' }}
          >
            <div className="space-y-6">
              <div className="w-10 h-px bg-[#C9A96E]" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#1A1A1A] leading-tight font-serif">
                Stay<br />Inspired
              </h2>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                Join our inner circle for first access to new collections, behind-the-scenes stories, and members-only offers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newsletter-email" className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-2 block">
                  Email Address
                </label>
                <input
                  type="email"
                  id="newsletter-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  aria-label="Email address for newsletter"
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-[#E8E4DF] text-[#1A1A1A] placeholder-[#CCC] focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm tracking-wider"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 bg-[#1A1A1A] text-white text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-[#333] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  'Subscribing...'
                ) : (
                  <>
                    <span>Subscribe</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {status === 'success' && (
              <div className="flex items-center gap-3 text-green-700 bg-green-50 px-4 py-3">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs tracking-wider">{message}</p>
              </div>
            )}
            {status === 'error' && (
              <p className="text-xs text-red-500 tracking-wider">{message}</p>
            )}
            {status === 'idle' && (
              <p className="text-[10px] text-[#AAA] tracking-wider">
                We respect your privacy. Unsubscribe at any time.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
