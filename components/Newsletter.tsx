import { color, motion } from 'framer-motion'
import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    // console.log('Newsletter subscription:', email)
    setEmail('')
  }

  return (
    <section className="py-12 md:py-20 bg-[#1A1A1A] w-full overflow-hidden">
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8 max-w-3xl text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 will-change-transform"
        >
          <h2 className="text-3xl md:text-4xl font-medium !text-white drop-shadow-md" >
            Join Our Newsletter
          </h2>

          <p className="text-base text-white/70 max-w-xl mx-auto">
            Be the first to hear about new collections, exclusive offers, and special events.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
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
                className="flex-1 px-5 py-3 bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#B91C1C] focus:ring-2 focus:ring-[#B91C1C]/30 transition-all text-sm rounded"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#B91C1C] text-[#1A1A1A] whitespace-nowrap text-sm font-medium hover:bg-white transition-all rounded"
              >
                Subscribe
              </button>
            </div>
            <p className="text-xs text-white/50 mt-3">
              By subscribing, you agree to our Privacy Policy.
            </p>
          </form>

        </motion.div>

      </div>
    </section>
  )
}
