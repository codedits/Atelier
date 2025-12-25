import { Header } from '@/components'
import Footer from '@/components/Footer'
import Head from 'next/head'

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service | Atelier Fine Jewellery</title>
        <meta name="description" content="Atelier's terms of service and conditions of use." />
        <meta property="og:title" content="Terms of Service | Atelier Fine Jewellery" />
        <meta property="og:description" content="Read Atelier's terms of service and conditions." />
      </Head>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl text-[#1A1A1A] mb-6 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-lg text-[#6B6B6B]">
              Last updated: December 16, 2025
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8 text-[#6B6B6B]">
            
            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">1. Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing and using Atelier Fine Jewellery's website and services, you accept and agree to be bound by and comply with these Terms of Service. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">2. Use License</h2>
              <p className="mb-3">Permission is granted to temporarily download one copy of the materials (information or software) on Atelier's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span>•</span><span>Modify or copy the materials</span></li>
                <li className="flex gap-2"><span>•</span><span>Use the materials for any commercial purpose or for any public display</span></li>
                <li className="flex gap-2"><span>•</span><span>Attempt to reverse engineer any software contained on the website</span></li>
                <li className="flex gap-2"><span>•</span><span>Transfer the materials to another person or "mirror" the materials on any other server</span></li>
                <li className="flex gap-2"><span>•</span><span>Remove any copyright or other proprietary notations from the materials</span></li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">3. Product Information</h2>
              <p className="mb-3">We strive to provide accurate product descriptions, pricing, and images on our website. However:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span>•</span><span>We do not warrant that product descriptions, pricing, or other content is accurate or error-free</span></li>
                <li className="flex gap-2"><span>•</span><span>Product colors may appear differently depending on your device display</span></li>
                <li className="flex gap-2"><span>•</span><span>We reserve the right to correct errors and limit quantities</span></li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">4. Pricing and Availability</h2>
              <p className="mb-3">All prices are subject to change without notice. Items are subject to availability. We reserve the right to:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span>•</span><span>Limit quantities</span></li>
                <li className="flex gap-2"><span>•</span><span>Discontinue products at any time</span></li>
                <li className="flex gap-2"><span>•</span><span>Cancel orders at our discretion if there is suspected fraud or abuse</span></li>
                <li className="flex gap-2"><span>•</span><span>Refuse service to anyone for any reason at any time</span></li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">5. Order Acceptance</h2>
              <p className="leading-relaxed">
                We reserve the right to refuse or cancel any order placed on our website. All orders are subject to acceptance and confirmation. We will send you an order confirmation email, which is our acceptance of your order.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">6. Payment and Billing</h2>
              <p className="mb-3">By placing an order, you agree to:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span>•</span><span>Provide accurate billing and shipping information</span></li>
                <li className="flex gap-2"><span>•</span><span>Authorize payment for the full order amount</span></li>
                <li className="flex gap-2"><span>•</span><span>Pay any applicable taxes and shipping costs</span></li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">7. User Conduct</h2>
              <p className="mb-3">You agree not to use our website for any unlawful or prohibited purposes, including:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span>•</span><span>Harassing or causing distress or inconvenience to any person</span></li>
                <li className="flex gap-2"><span>•</span><span>Obscene or offensive language</span></li>
                <li className="flex gap-2"><span>•</span><span>Disrupting the normal flow of dialogue in our website</span></li>
                <li className="flex gap-2"><span>•</span><span>Any intellectual property infringement</span></li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">8. Intellectual Property</h2>
              <p className="leading-relaxed">
                All content on this website, including text, graphics, logos, images, and software, is the property of Atelier Fine Jewellery or its content suppliers and is protected by international copyright laws. Unauthorized use of any content is prohibited.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">9. Limitation of Liability</h2>
              <p className="leading-relaxed">
                In no event shall Atelier Fine Jewellery or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Atelier's website, even if Atelier or its authorized representative has been notified of the possibility of such damages.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">10. Accuracy of Materials</h2>
              <p className="leading-relaxed">
                The materials appearing on Atelier's website could include technical, typographical, or photographic errors. Atelier does not warrant that any of the materials on its website are accurate, complete, or current. Atelier may make changes to the materials contained on its website at any time without notice.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">11. Links</h2>
              <p className="leading-relaxed">
                Atelier has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Atelier of the site. Use of any such linked website is at the user's own risk.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">12. Modifications to Terms</h2>
              <p className="leading-relaxed">
                Atelier may revise these Terms of Service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these Terms of Service.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">13. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms and Conditions are governed by and construed in accordance with the laws of Pakistan and you irrevocably submit to the exclusive jurisdiction of the courts located therein.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">14. Contact Information</h2>
              <p className="mb-3">If you have any questions about these Terms of Service, please contact us:</p>
              <div className="space-y-2">
                <p>Email: hello@atelier.com</p>
                <p>Phone: +92 (300) 123-4567</p>
                <p>Address: Atelier Fine Jewellery, Lahore, Pakistan</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
