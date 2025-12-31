import { Header } from '@/components'
import Footer from '@/components/Footer'
import Head from 'next/head'
import { useState } from 'react'
import { SITE_NAME, CONTACT_EMAIL } from '@/lib/constants'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'What materials do you use in your jewelry?',
    answer: 'We use only premium materials including 18K and 14K gold, platinum, ethically sourced diamonds, and carefully selected gemstones. All materials are certified and sourced responsibly.'
  },
  {
    question: 'How long does it take to create a custom piece?',
    answer: 'Our custom pieces typically take 4-8 weeks to create, depending on the complexity of the design and current demand. Rush orders may be available upon request with an additional fee.'
  },
  {
    question: 'Do you offer resizing and repairs?',
    answer: 'Yes, we offer comprehensive resizing and repair services for all pieces, including those not purchased from us. Please contact our team for an estimate.'
  },
  {
    question: 'What is your warranty and care policy?',
    answer: 'All our pieces come with a lifetime warranty against manufacturing defects. We provide complimentary cleaning and inspection services. Proper care instructions are included with every purchase.'
  },
  {
    question: 'Can I custom design a piece?',
    answer: 'Absolutely! We specialize in bespoke jewelry design. Our artisans work closely with you throughout the design process to create a unique piece that reflects your vision and personality.'
  },
  {
    question: 'How do you ensure the authenticity of diamonds and gemstones?',
    answer: 'All diamonds over 0.5 carats come with official certification from reputable grading laboratories. We also provide detailed product documentation for all gemstones.'
  },
  {
    question: 'What is your return and exchange policy?',
    answer: 'We offer a 30-day return policy for unworn items in original condition. Custom pieces cannot be returned but can be exchanged with approval. See our Returns Policy page for full details.'
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship worldwide. International orders may take 2-3 weeks depending on the destination. All international shipments are fully insured and tracked.'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <>
      <Head>
        <title>FAQs | {SITE_NAME}</title>
        <meta name="description" content={`Frequently asked questions about ${SITE_NAME} jewelry, shipping, returns, warranties, and custom design.`} />
        <meta property="og:title" content={`FAQs | ${SITE_NAME}`} />
        <meta property="og:description" content={`Frequently asked questions about ${SITE_NAME} jewelry, shipping, returns, warranties, and custom design.`} />
      </Head>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl text-[#1A1A1A] mb-6 tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-[#6B6B6B]">
              Find answers to common questions about our jewelry, services, and policies.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-[#E5E5E5] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#F8F7F5] transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-[#1A1A1A] text-left">
                      {faq.question}
                    </h3>
                    <span className={`text-[#B91C1C] text-xl transition-transform duration-300 ${openIndex === index ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>
                  {openIndex === index && (
                    <div className="px-6 py-4 border-t border-[#E5E5E5] bg-[#F8F7F5]">
                      <p className="text-[#6B6B6B] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Section */}
            <div className="mt-16 bg-[#F8F7F5] rounded-lg p-8 text-center">
              <h3 className="font-display text-2xl text-[#1A1A1A] mb-4">
                Didn't find your answer?
              </h3>
              <p className="text-[#6B6B6B] mb-6">
                Our customer service team is here to help. Reach out to us for any additional questions.
              </p>
              <a 
                href={`mailto:${CONTACT_EMAIL}`} 
                className="inline-block px-8 py-3 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#B91C1C] transition-colors font-medium"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
