import { Header } from '@/components'
import Footer from '@/components/Footer'
import Head from 'next/head'
import Image from 'next/image'

export default function About() {
  return (
    <>
      <Head>
        <title>About Atelier | Handcrafted Fine Jewellery</title>
        <meta name="description" content="Discover Atelier's story. Since 1987, crafting exquisite handmade jewelry with premium materials and timeless elegance." />
        <meta property="og:title" content="About Atelier | Handcrafted Fine Jewellery" />
        <meta property="og:description" content="Discover Atelier's story. Since 1987, crafting exquisite handmade jewelry with premium materials and timeless elegance." />
      </Head>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] mb-6 tracking-tight">
                About Atelier
              </h1>
              <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
                Three decades of excellence in fine jewelry craftsmanship
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative h-96 md:h-full min-h-96">
                  <Image
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop"
                    alt="Handcrafted jewelry"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
              <div>
                <h2 className="font-display text-3xl md:text-4xl text-[#1A1A1A] mb-6">
                  Crafted for Eternity
                </h2>
                <p className="text-lg text-[#6B6B6B] mb-4 leading-relaxed">
                  Since 1987, Atelier has been synonymous with exceptional craftsmanship and timeless beauty. Our journey began with a simple vision: to create jewelry that transcends trends and becomes a cherished heirloom.
                </p>
                <p className="text-lg text-[#6B6B6B] mb-4 leading-relaxed">
                  Every piece is meticulously crafted by our master artisans using only the finest materials — ethically sourced diamonds, premium metals, and carefully selected gemstones. We believe that luxury is not about excess, but about the art of perfection.
                </p>
                <p className="text-lg text-[#6B6B6B] leading-relaxed">
                  Our commitment to quality extends beyond the product. We work closely with our clients to understand their vision and create bespoke pieces that tell their unique stories.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl text-[#1A1A1A] mb-12 text-center">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Craftsmanship',
                  description: 'Every piece is handcrafted with meticulous attention to detail by our master artisans with decades of experience.'
                },
                {
                  title: 'Authenticity',
                  description: 'We believe in transparency and authenticity in all our materials, processes, and customer relationships.'
                },
                {
                  title: 'Sustainability',
                  description: 'We source ethical materials and employ sustainable practices to minimize our environmental impact.'
                }
              ].map((value, index) => (
                <div key={index} className="bg-[#F8F7F5] p-8 rounded-lg border border-[#E5E5E5]">
                  <h3 className="text-xl font-semibold text-[#1A1A1A] mb-3">{value.title}</h3>
                  <p className="text-[#6B6B6B] leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl text-[#1A1A1A] mb-12 text-center">
              Master Craftspeople
            </h2>
            <p className="text-center text-[#6B6B6B] max-w-2xl mx-auto mb-12">
              Our team comprises award-winning artisans and designers who bring decades of experience to each creation. From design to execution, every step reflects our unwavering commitment to excellence.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
