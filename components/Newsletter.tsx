import { motion } from 'framer-motion'
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
    <section className="py-12 md:py-20 bg-[#F8F7F5]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 will-change-transform"
        >
          <h2 className="text-3xl md:text-4xl font-medium text-[#1A1A1A]">
            Join Our Newsletter
          </h2>

          <p className="text-base text-[#6B6B6B] max-w-xl mx-auto">
            Be the first to hear about new collections, exclusive offers, and special events.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-5 py-3 bg-white border border-[#E5E5E5] text-[#1A1A1A] placeholder-[#6B6B6B] focus:outline-none focus:border-[#1A1A1A] transition-colors text-sm"
              />
              <button
                type="submit"
                className="btn btn-primary px-6 py-3 whitespace-nowrap text-sm"
              >
                Subscribe
              </button>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-3">
              By subscribing, you agree to our Privacy Policy.
            </p>
          </form>

        </motion.div>

      </div>
    </section>
  )
}
