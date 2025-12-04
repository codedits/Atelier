import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email)
    setEmail('')
  }

  return (
    <section className="py-24 md:py-32 bg-black">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-block px-4 py-2 border border-[#D4AF37]/30 text-xs tracking-[0.25em] uppercase text-[#D4AF37]">
            Exclusive Access
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white">
            Join the Inner Circle
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Exclusive releases & member-only offers. Be the first to discover our newest collections.
          </p>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 bg-[#111] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button
                type="submit"
                className="btn btn-primary px-8 py-4 whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>

        </motion.div>

      </div>
    </section>
  )
}
