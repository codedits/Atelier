import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Testimonial {
  id: string
  customer_name: string
  content: string
  rating: number
  display_order: number
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    content: "Exceptional craftsmanship and timeless elegance.",
    customer_name: "Sarah M.",
    rating: 5,
    display_order: 0
  },
  {
    id: '2',
    content: "Each piece tells a story of beauty and precision.",
    customer_name: "James D.",
    rating: 5,
    display_order: 1
  },
  {
    id: '3',
    content: "Quality that exceeds every expectation.",
    customer_name: "Emily R.",
    rating: 5,
    display_order: 2
  }
]

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials)

  useEffect(() => {
    fetch('/api/admin/testimonials')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          setTestimonials(data)
        }
      })
      .catch(err => console.error('Failed to load testimonials:', err))
  }, [])

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12 will-change-transform"
        >
          <h2 className="text-3xl md:text-4xl font-medium text-[#1A1A1A] mb-3">
            What Our Clients Say
          </h2>
          <p className="text-[#6B6B6B] text-sm">
            Trusted by jewelry enthusiasts worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#F8F7F5] p-8 hover:shadow-md transition-shadow duration-300 will-change-transform"
            >
              <div className="flex flex-col text-center space-y-4">
                {/* Stars */}
                <div className="flex justify-center gap-1 text-[#D4A5A5]">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[#6B6B6B] text-sm leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Name */}
                <div className="text-xs text-[#1A1A1A] font-medium pt-2">
                  {testimonial.customer_name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
