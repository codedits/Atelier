import { Header } from '@/components'
import Footer from '@/components/Footer'
import Head from 'next/head'

export default function ShippingInfo() {
  return (
    <>
      <Head>
        <title>Shipping Information | Atelier Fine Jewellery</title>
        <meta name="description" content="Atelier shipping information, delivery times, costs, and tracking details." />
        <meta property="og:title" content="Shipping Information | Atelier Fine Jewellery" />
        <meta property="og:description" content="Learn about Atelier's shipping options, delivery times, and policies." />
      </Head>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl text-[#1A1A1A] mb-6 tracking-tight">
              Shipping Information
            </h1>
            <p className="text-lg text-[#6B6B6B]">
              Fast, secure, and insured delivery to your door.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Shipping Options */}
            <div>
              <h2 className="font-display text-3xl text-[#1A1A1A] mb-8">Shipping Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    title: 'Standard Delivery',
                    time: '5-7 business days',
                    cost: 'Free on orders over ₨5,000',
                    details: 'Nationwide delivery with full insurance and tracking'
                  },
                  {
                    title: 'Express Delivery',
                    time: '2-3 business days',
                    cost: '₨500',
                    details: 'Priority handling and same-day dispatch'
                  },
                  {
                    title: 'International Shipping',
                    time: '10-20 business days',
                    cost: 'Calculated at checkout',
                    details: 'Worldwide shipping with full customs documentation'
                  },
                  {
                    title: 'Same Day Delivery',
                    time: 'Lahore only',
                    cost: '₨1,500',
                    details: 'Order before 12 PM for same-day delivery'
                  }
                ].map((option, index) => (
                  <div key={index} className="border border-[#E5E5E5] rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">{option.title}</h3>
                    <p className="text-[#B91C1C] font-semibold mb-2">{option.time}</p>
                    <p className="text-[#6B6B6B] mb-3">{option.cost}</p>
                    <p className="text-sm text-[#9CA3AF]">{option.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Packaging */}
            <div>
              <h2 className="font-display text-3xl text-[#1A1A1A] mb-6">Premium Packaging</h2>
              <p className="text-[#6B6B6B] mb-4 leading-relaxed">
                Every piece from Atelier arrives in our signature packaging designed to protect your precious jewelry and enhance your unboxing experience. Each item is:
              </p>
              <ul className="space-y-3">
                {[
                  'Carefully wrapped in premium tissue paper',
                  'Placed in an elegant branded jewelry box',
                  'Protected with bubble wrap and padding',
                  'Shipped in a sturdy branded mailer',
                  'Fully insured during transit'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-[#B91C1C] font-bold mt-1">✓</span>
                    <span className="text-[#6B6B6B]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Insurance & Tracking */}
            <div>
              <h2 className="font-display text-3xl text-[#1A1A1A] mb-6">Insurance & Tracking</h2>
              <div className="space-y-4">
                <p className="text-[#6B6B6B] leading-relaxed">
                  All shipments from Atelier are fully insured against loss, theft, or damage during transit. You'll receive a tracking number via email immediately after dispatch, allowing you to monitor your delivery in real-time.
                </p>
                <p className="text-[#6B6B6B] leading-relaxed">
                  In the unlikely event of any damage or loss, please contact us within 48 hours of delivery. We maintain comprehensive insurance coverage and will work to resolve any issues promptly.
                </p>
              </div>
            </div>

            {/* Customs & International */}
            <div>
              <h2 className="font-display text-3xl text-[#1A1A1A] mb-6">International Orders & Customs</h2>
              <p className="text-[#6B6B6B] mb-4 leading-relaxed">
                For international shipments, we provide all necessary documentation including detailed invoices and certificates of authenticity. Customers are responsible for any applicable customs duties or taxes in their country.
              </p>
              <p className="text-[#6B6B6B] leading-relaxed">
                We work with trusted international couriers to ensure smooth customs clearance. Typical delivery times for international orders are 10-20 business days depending on the destination country.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-[#F8F7F5] rounded-lg p-8">
              <h3 className="font-display text-2xl text-[#1A1A1A] mb-4">Questions about shipping?</h3>
              <p className="text-[#6B6B6B] mb-4">
                Contact our customer service team for more information.
              </p>
              <a 
                href="mailto:hello@atelier.com" 
                className="inline-block px-6 py-2 bg-[#1A1A1A] text-white rounded hover:bg-[#B91C1C] transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
