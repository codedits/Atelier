import { motion } from 'framer-motion'

const testimonials = [
  {
    id: 1,
    initials: "S.M.",
    quote: "Exceptional craftsmanship and smooth luxury finish.",
    name: "Sarah Mitchell"
  },
  {
    id: 2,
    initials: "J.D.",
    quote: "Each piece tells a story of elegance and precision.",
    name: "James Davidson"
  },
  {
    id: 3,
    initials: "E.R.",
    quote: "Timeless beauty that exceeds every expectation.",
    name: "Emily Richardson"
  },
  {
    id: 4,
    initials: "M.C.",
    quote: "A true investment in artistry and refinement.",
    name: "Michael Chen"
  }
]

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32 bg-black border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-500 text-sm uppercase tracking-wider">
            Trusted by Connoisseurs Worldwide
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-[#111] border border-white/5 p-8 hover:border-[#D4AF37]/30 transition-all duration-500"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Initials Circle */}
                <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/50 flex items-center justify-center">
                  <span className="text-[#D4AF37] text-lg font-light tracking-wider">
                    {testimonial.initials}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-gray-300 text-base leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                {/* Name */}
                <div className="text-xs text-gray-600 uppercase tracking-widest pt-4 border-t border-white/5">
                  {testimonial.name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
