import { Header } from '@/components'
import Footer from '@/components/Footer'
import Head from 'next/head'
import { SITE_NAME, CONTACT_EMAIL } from '@/lib/constants'

export default function CookiePolicy() {
  return (
    <>
      <Head>
        <title>Cookie Policy | {SITE_NAME}</title>
        <meta name="description" content={`${SITE_NAME}'s cookie policy explains how we use cookies and similar technologies.`} />
        <meta property="og:title" content={`Cookie Policy | ${SITE_NAME}`} />
        <meta property="og:description" content={`Learn about ${SITE_NAME}'s use of cookies and tracking technologies.`} />
      </Head>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl text-[#1A1A1A] mb-6 tracking-tight">
              Cookie Policy
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
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">1. What Are Cookies?</h2>
              <p className="leading-relaxed">
                Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit our website. They allow us to recognize you and improve your browsing experience. Cookies can be "persistent" cookies that remain on your device until deleted, or "session" cookies that are deleted when you close your browser.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">2. How We Use Cookies</h2>
              <p className="mb-3">We use cookies for various purposes, including:</p>
              <ul className="space-y-3">
                <li>
                  <strong className="text-[#1A1A1A]">Essential Cookies</strong>
                  <p className="text-sm mt-1">These cookies are necessary for our website to function properly. They enable you to navigate and use features such as shopping cart and checkout processes.</p>
                </li>
                <li>
                  <strong className="text-[#1A1A1A]">Performance Cookies</strong>
                  <p className="text-sm mt-1">These cookies collect information about how you use our website, such as which pages you visit most often. This helps us improve our site's performance and user experience.</p>
                </li>
                <li>
                  <strong className="text-[#1A1A1A]">Functional Cookies</strong>
                  <p className="text-sm mt-1">These cookies remember your preferences and settings so we can personalize your experience when you return to our website.</p>
                </li>
                <li>
                  <strong className="text-[#1A1A1A]">Marketing Cookies</strong>
                  <p className="text-sm mt-1">These cookies are used to track your activities and deliver personalized advertisements based on your interests.</p>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">3. Third-Party Cookies</h2>
              <p className="mb-3">We also use third-party service providers that may set cookies on your device, including:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span>•</span><span>Google Analytics - for website analytics and traffic tracking</span></li>
                <li className="flex gap-2"><span>•</span><span>Payment processors - for secure transaction processing</span></li>
                <li className="flex gap-2"><span>•</span><span>Social media platforms - for social integration and advertising</span></li>
                <li className="flex gap-2"><span>•</span><span>Advertising networks - for targeted advertising campaigns</span></li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">4. Similar Tracking Technologies</h2>
              <p className="mb-3">In addition to cookies, we may use other similar tracking technologies, including:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span>•</span><span>Pixels and beacons - for tracking user interactions</span></li>
                <li className="flex gap-2"><span>•</span><span>Local storage - for storing user preferences locally</span></li>
                <li className="flex gap-2"><span>•</span><span>Log files - for recording website usage statistics</span></li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">5. Your Cookie Choices</h2>
              <p className="mb-4 leading-relaxed">
                Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or alert you when cookies are being sent. Here's how to control cookies in popular browsers:
              </p>
              <div className="bg-[#F8F7F5] rounded-lg p-6 space-y-3">
                <p><strong className="text-[#1A1A1A]">Google Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other site data</p>
                <p><strong className="text-[#1A1A1A]">Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</p>
                <p><strong className="text-[#1A1A1A]">Safari:</strong> Preferences &gt; Privacy &gt; Cookies and website data</p>
                <p><strong className="text-[#1A1A1A]">Edge:</strong> Settings &gt; Privacy, search, and services &gt; Cookies and other site permissions</p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">6. Impact of Disabling Cookies</h2>
              <p className="leading-relaxed">
                While you can disable cookies, please note that some essential cookies are required for our website to function properly. Disabling cookies may limit your ability to use certain features, such as shopping cart functionality, account login, and personalized recommendations.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">7. Do Not Track</h2>
              <p className="leading-relaxed">
                Some browsers include a "Do Not Track" feature. Currently, there is no industry standard for recognizing DNT signals, and we do not currently respond to DNT signals. However, you can use other tools to control data collection and use as described in this policy.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">8. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other reasons. Changes will be posted on this page with an updated effective date. Your continued use of our website constitutes acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#1A1A1A] mb-4">9. Contact Us</h2>
              <p className="mb-3">If you have questions about this Cookie Policy or our use of cookies, please contact us:</p>
              <div className="space-y-2">
                <p>Email: {CONTACT_EMAIL}</p>
                <p>Phone: +92 (300) 123-4567</p>
                <p>Address: {SITE_NAME}, Karachi, Pakistan</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
