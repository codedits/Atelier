import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SITE_NAME, CONTACT_EMAIL } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Returns Policy | ${SITE_NAME}`,
  description: `${SITE_NAME}'s comprehensive returns and refund policy. Easy returns within 30 days.`,
}

export default function ReturnsPolicyPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8"><div className="max-w-4xl mx-auto text-center"><h1 className="font-display text-4xl md:text-5xl text-[#1A1A1A] mb-6 tracking-tight">Returns & Refund Policy</h1><p className="text-lg text-[#4A4A4A]">Your satisfaction is our priority. Shop with confidence.</p></div></section>
        <section className="py-16 md:py-24 px-6 lg:px-8"><div className="max-w-4xl mx-auto space-y-12">
          <div><h2 className="font-display text-3xl text-[#1A1A1A] mb-6">30-Day Return Policy</h2><p className="text-[#4A4A4A] mb-4 leading-relaxed">We offer a hassle-free 30-day return policy on all non-custom jewelry pieces. If you&apos;re not completely satisfied with your purchase, you can return it for a full refund within 30 days of delivery.</p><div className="bg-[#F8F7F5] rounded-lg p-6 border border-[#E5E5E5]"><h3 className="font-semibold text-[#1A1A1A] mb-3">Return Eligibility:</h3><ul className="space-y-2">{['Item must be unworn and in original condition', 'All tags and packaging must be intact', 'Original receipt or proof of purchase required', 'Item must not show signs of wear or damage', 'Return must be initiated within 30 days of delivery'].map((item, index) => (<li key={index} className="flex items-start gap-3"><span className="text-[#1A1A1A] font-bold mt-0.5">✓</span><span className="text-[#4A4A4A]">{item}</span></li>))}</ul></div></div>
          <div><h2 className="font-display text-3xl text-[#1A1A1A] mb-6">How to Return an Item</h2><div className="space-y-4">{[{ step: '1', title: 'Contact Us', description: `Email ${CONTACT_EMAIL} or call us to initiate a return. Provide your order number and reason for return.` }, { step: '2', title: 'Receive Return Instructions', description: 'We\'ll provide you with a prepaid return shipping label and detailed instructions.' }, { step: '3', title: 'Ship Your Return', description: 'Pack the item securely in its original packaging and use the provided shipping label.' }, { step: '4', title: 'Receive Your Refund', description: 'Once we receive and inspect your return, we\'ll process your refund within 5-7 business days.' }].map((item, index) => (<div key={index} className="flex gap-4 pb-6 border-b border-[#E5E5E5] last:border-b-0"><div className="flex-shrink-0 w-10 h-10 bg-[#1A1A1A] rounded-full flex items-center justify-center text-white font-bold">{item.step}</div><div><h3 className="font-semibold text-[#1A1A1A] mb-1">{item.title}</h3><p className="text-[#4A4A4A]">{item.description}</p></div></div>))}</div></div>
          <div><h2 className="font-display text-3xl text-[#1A1A1A] mb-6">Exchanges</h2><p className="text-[#4A4A4A] mb-4 leading-relaxed">We&apos;re happy to exchange your item for a different size, color, or design within 30 days of purchase. Please contact us to arrange an exchange.</p><p className="text-[#4A4A4A] leading-relaxed">If you&apos;re exchanging for a higher-priced item, you&apos;ll pay the difference. If exchanging for a lower-priced item, we&apos;ll credit the difference to your account.</p></div>
          <div><h2 className="font-display text-3xl text-[#1A1A1A] mb-6">Custom Orders & Bespoke Pieces</h2><p className="text-[#4A4A4A] leading-relaxed">Custom and bespoke pieces are non-returnable as they are created specifically to your specifications. However, if there&apos;s a manufacturing defect, we&apos;ll repair or replace the item at no cost. We&apos;re committed to working with you to ensure your bespoke piece exceeds your expectations.</p></div>
          <div className="bg-[#F8F7F5] rounded-lg p-8"><h2 className="font-display text-3xl text-[#1A1A1A] mb-6">Lifetime Warranty</h2><p className="text-[#4A4A4A] mb-4 leading-relaxed">All Atelier pieces come with a lifetime warranty covering manufacturing defects including broken clasps, loose settings, or stone displacement.</p><p className="text-[#4A4A4A] mb-4 leading-relaxed">This warranty does not cover damage from accidents, misuse, or normal wear and tear. Our expert craftspeople will repair any defects promptly at no charge.</p><p className="text-[#4A4A4A] leading-relaxed">We also offer complimentary cleaning, polishing, and inspection services for all pieces.</p></div>
          <div><h2 className="font-display text-3xl text-[#1A1A1A] mb-6">Damaged or Defective Items</h2><p className="text-[#4A4A4A] mb-4 leading-relaxed">If your item arrives damaged or defective, please contact us within 48 hours with photos. We&apos;ll arrange an immediate replacement or full refund.</p><p className="text-[#4A4A4A] leading-relaxed">We take pride in our quality control, but accidents can happen during shipping. We&apos;re committed to making it right.</p></div>
          <div className="bg-[#F8F7F5] rounded-lg p-8 text-center border-l-4 border-[#1A1A1A]"><h3 className="font-display text-2xl text-[#1A1A1A] mb-4">Need Help with a Return?</h3><p className="text-[#4A4A4A] mb-6">Our customer service team is here to help. Contact us anytime.</p><div className="space-y-3"><a href={`mailto:${CONTACT_EMAIL}`} className="block text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors font-medium">Email: {CONTACT_EMAIL}</a><a href="tel:+923001234567" className="block text-[#1A1A1A] hover:text-[#1A1A1A] transition-colors font-medium">Phone: +92 (300) 123-4567</a></div></div>
        </div></section>
      </main>
      <Footer />
    </>
  )
}
