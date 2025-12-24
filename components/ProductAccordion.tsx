import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  isOpen: boolean
  onClick: () => void
}

const AccordionItem = ({ title, children, isOpen, onClick, icon }: AccordionItemProps & { icon?: React.ReactNode }) => {
  return (
    <div className="border-b border-[#E5E7EB]">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-4">
          {icon && <span className="text-[#7A4A2B]">{icon}</span>}
          <span className="text-sm font-medium uppercase tracking-[0.2em] text-[#1A1A1A] group-hover:text-[#7A4A2B] transition-colors font-poppins">
            {title}
          </span>
        </div>
        <div className="relative w-5 h-5">
          <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="pb-8 pl-9 text-base text-[#374151] leading-relaxed space-y-4 font-poppins font-normal max-w-2xl">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ProductAccordionProps {
  details?: string
  materials?: string
  shipping?: string
}

const ProductAccordion = memo(function ProductAccordion({ details, materials, shipping }: ProductAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const items = [
    {
      title: 'Details & Fit',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      content: details || 'Handcrafted with precision and care. Each piece is unique and may vary slightly in appearance, adding to its individual character and charm.'
    },
    {
      title: 'Materials & Care',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      content: materials || 'Crafted from premium 18k gold and ethically sourced gemstones. To maintain its brilliance, avoid contact with perfumes, lotions, and water. Store in a cool, dry place.'
    },
    {
      title: 'Shipping & Returns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      content: shipping || 'Complimentary shipping on orders over ₨5,000. Returns are accepted within 30 days of delivery for a full refund or exchange, provided the item is in its original condition.'
    }
  ]

  return (
    <div className="mt-12 border-t border-[#E5E7EB]">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          icon={item.icon}
          isOpen={openIndex === index}
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        >
          <p>{item.content}</p>
        </AccordionItem>
      ))}
    </div>
  )
})

export default ProductAccordion
