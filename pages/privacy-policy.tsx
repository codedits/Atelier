import { Header } from '@/components'
import Footer from '@/components/Footer'
import Head from 'next/head'

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Atelier Fine Jewellery</title>
        <meta name="description" content="Atelier's privacy policy explains how we collect, use, and protect your personal information." />
        <meta property="og:title" content="Privacy Policy | Atelier Fine Jewellery" />
        <meta property="og:description" content="Read Atelier's comprehensive privacy policy." />
      </Head>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl text-[#1A1A1A] mb-6 tracking-tight">
              Privacy Policy
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
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">1. Introduction</h2>
              <p className="leading-relaxed mb-4">
                Atelier Fine Jewellery ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">2. Information We Collect</h2>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Personal Information</h3>
              <p className="mb-3">We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
              <ul className="space-y-2 mb-4 ml-4">
                <li className="flex gap-2"><span>•</span><span>Name, email address, and phone number</span></li>
                <li className="flex gap-2"><span>•</span><span>Billing and shipping addresses</span></li>
                <li className="flex gap-2"><span>•</span><span>Payment information (processed securely)</span></li>
                <li className="flex gap-2"><span>•</span><span>Account credentials and preferences</span></li>
                <li className="flex gap-2"><span>•</span><span>Order history and communication</span></li>
              </ul>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Automatically Collected Information</h3>
              <p>When you access our website, we may automatically collect certain information including IP address, browser type, device information, and usage patterns through cookies and similar technologies.</p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">3. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect in the following ways:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span>•</span><span>To process and fulfill your orders</span></li>
                <li className="flex gap-2"><span>•</span><span>To send transactional and promotional emails</span></li>
                <li className="flex gap-2"><span>•</span><span>To improve our website and services</span></li>
                <li className="flex gap-2"><span>•</span><span>To prevent fraud and ensure security</span></li>
                <li className="flex gap-2"><span>•</span><span>To comply with legal obligations</span></li>
                <li className="flex gap-2"><span>•</span><span>To personalize your experience</span></li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">4. Information Sharing</h2>
              <p className="mb-3">We do not sell, trade, or rent your personal information. We may share your information with:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span>•</span><span>Service providers who assist us in operating our website and conducting business</span></li>
                <li className="flex gap-2"><span>•</span><span>Payment processors to complete transactions</span></li>
                <li className="flex gap-2"><span>•</span><span>Shipping carriers for delivery purposes</span></li>
                <li className="flex gap-2"><span>•</span><span>Legal authorities when required by law</span></li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">5. Security</h2>
              <p className="leading-relaxed">
                We implement comprehensive security measures to protect your personal information including SSL encryption, secure payment processing, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">6. Cookies and Tracking</h2>
              <p className="leading-relaxed mb-3">
                Our website uses cookies to enhance your experience, remember preferences, and analyze site usage. You can control cookie settings in your browser, though disabling cookies may affect website functionality.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">7. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span>•</span><span>Access your personal information</span></li>
                <li className="flex gap-2"><span>•</span><span>Correct inaccurate information</span></li>
                <li className="flex gap-2"><span>•</span><span>Request deletion of your information</span></li>
                <li className="flex gap-2"><span>•</span><span>Opt-out of marketing communications</span></li>
                <li className="flex gap-2"><span>•</span><span>Withdraw consent at any time</span></li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">8. Third-Party Links</h2>
              <p className="leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party sites before providing personal information.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">9. Children's Privacy</h2>
              <p className="leading-relaxed">
                Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete such information promptly.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">10. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Your continued use of our website constitutes acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">11. Contact Us</h2>
              <p className="mb-3">If you have questions about this Privacy Policy, please contact us:</p>
              <div className="space-y-2">
                <p>Email: hello@atelier.com</p>
                <p>Phone: +92 (300) 123-4567</p>
                <p>Address: Atelier Fine Jewellery, Karachi, Pakistan</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
