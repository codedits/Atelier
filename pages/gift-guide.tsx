import { Header } from '@/components'
import Footer from '@/components/Footer'
import Head from 'next/head'
import Image from 'next/image'

interface GiftGuideCategory {
  title: string
  description: string
  priceRange: string
  items: string[]
  image: string
}

const giftGuideCategories: GiftGuideCategory[] = [
  {
    title: 'For the Romantic',
    description: 'Express your deepest affection with timeless pieces that celebrate love and devotion.',
    priceRange: '₨15,000 - ₨100,000+',
    items: ['Diamond Pendants', 'Engagement Rings', 'Couple Bracelets', 'Romantic Earrings', 'Love Bracelets'],
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop'
  },
  {
    title: 'For the Modern Woman',
    description: 'Contemporary designs that blend elegance with bold, statement-making style.',
    priceRange: '₨8,000 - ₨50,000',
    items: ['Geometric Rings', 'Minimalist Necklaces', 'Statement Earrings', 'Modern Bracelets', 'Sleek Pendants'],
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop'
  },
  {
    title: 'For the Sophisticated Man',
    description: 'Refined pieces crafted for the discerning gentleman who appreciates quality.',
    priceRange: '₨10,000 - ₨75,000',
    items: ['Cufflinks', 'Rings', 'Chains', 'Bracelets', 'Signet Rings'],
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop'
  },
  {
    title: 'For the Trendsetter',
    description: 'Bold, innovative designs that push boundaries and make a fashion statement.',
    priceRange: '₨7,000 - ₨40,000',
    items: ['Colored Gemstones', 'Avant-Garde Designs', 'Mixed Metals', 'Statement Pieces', 'Unique Cuts'],
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop'
  },
  {
    title: 'For the Minimalist',
    description: 'Clean, understated elegance that speaks volumes through simplicity.',
    priceRange: '₨5,000 - ₨35,000',
    items: ['Simple Bands', 'Delicate Chains', 'Studs', 'Thin Bracelets', 'Essential Pieces'],
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=600&fit=crop'
  },
  {
    title: 'For Milestone Moments',
    description: 'Celebrate life\'s most important moments with jewelry that becomes heirloom-worthy.',
    priceRange: '₨20,000 - ₨150,000+',
    items: ['Birthstone Rings', 'Anniversary Pieces', 'Graduation Gifts', 'Birthday Specials', 'Custom Creations'],
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop'
  }
]

export default function GiftGuide() {
  return (
    <>
      <Head>
        <title>Gift Guide | Atelier Fine Jewellery</title>
        <meta name="description" content="Atelier's gift guide to find the perfect piece for every occasion, personality, and budget." />
        <meta property="og:title" content="Gift Guide | Atelier Fine Jewellery" />
        <meta property="og:description" content="Discover the perfect jewelry gift from our curated collections." />
      </Head>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#F8F7F5] to-white py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] mb-6 tracking-tight">
              Gift Guide
            </h1>
            <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
              Find the perfect piece for every personality, occasion, and budget. From romantic gestures to personal milestones, our curated collections help you choose with confidence.
            </p>
          </div>
        </section>

        {/* Guide Categories */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-16">
              {giftGuideCategories.map((category, index) => (
                <div key={index} className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-cols-2 md:[direction:rtl]' : ''}`}>
                  {/* Image/Placeholder */}
                  <div>
                    <div className="relative h-96 rounded-lg overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div>
                    <h2 className="font-display text-3xl md:text-4xl text-[#1A1A1A] mb-3">
                      {category.title}
                    </h2>
                    <p className="text-[#6B6B6B] text-lg mb-6 leading-relaxed">
                      {category.description}
                    </p>
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-[#1A1A1A] mb-2">PRICE RANGE</p>
                      <p className="text-[#D4A5A5] font-medium text-lg">{category.priceRange}</p>
                    </div>
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-[#1A1A1A] mb-3">COLLECTION INCLUDES</p>
                      <ul className="space-y-2">
                        {category.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-[#6B6B6B]">
                            <span className="w-1.5 h-1.5 bg-[#D4A5A5] rounded-full"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button className="px-6 py-3 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors font-medium">
                      Explore Collection
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl text-[#1A1A1A] mb-12 text-center">
              Choosing the Perfect Gift
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Know Their Style',
                  description: 'Consider whether they prefer bold statement pieces or delicate, minimal designs. Think about their everyday aesthetic.'
                },
                {
                  title: 'Consider the Occasion',
                  description: 'Different moments call for different pieces. A proposal deserves something timeless, while a birthday might showcase personal style.'
                },
                {
                  title: 'Metal Preferences',
                  description: 'Does the recipient typically wear gold, silver, rose gold, or platinum? This helps ensure compatibility with existing pieces.'
                },
                {
                  title: 'Gemstone Meanings',
                  description: 'Birthstones, traditional gemstones, and stones with personal significance add a meaningful dimension to your gift.'
                },
                {
                  title: 'Skin Tone & Tone',
                  description: 'Certain metals and stones complement different skin tones beautifully. Consult our experts for personalized recommendations.'
                },
                {
                  title: 'Sizing & Fit',
                  description: 'For rings, knowing the correct size is essential. We offer free sizing, so don\'t worry if you\'re unsure.'
                }
              ].map((tip, index) => (
                <div key={index} className="bg-[#F8F7F5] rounded-lg p-6 border border-[#E5E5E5]">
                  <h3 className="font-semibold text-[#1A1A1A] mb-3">{tip.title}</h3>
                  <p className="text-[#6B6B6B] text-sm leading-relaxed">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Personal Shopping Section */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-[#F8F7F5] rounded-lg p-8 md:p-12">
            <h2 className="font-display text-3xl text-[#1A1A1A] mb-4">
              Need Personalized Help?
            </h2>
            <p className="text-[#6B6B6B] text-lg mb-8 leading-relaxed">
              Our expert team is ready to help you find the perfect piece. Schedule a personal consultation or call us for styling advice tailored to your recipient.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-[#1A1A1A] text-white rounded hover:bg-[#D4A5A5] transition-colors font-medium">
                Schedule Consultation
              </button>
              <a 
                href="tel:+923001234567"
                className="px-8 py-3 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors font-medium"
              >
                Call Us
              </a>
            </div>
          </div>
        </section>

        {/* Custom Gift Section */}
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl text-[#1A1A1A] mb-6">
              Create a Custom Piece
            </h2>
            <p className="text-[#6B6B6B] text-lg mb-8 leading-relaxed">
              Can't find exactly what you're looking for? We specialize in bespoke jewelry. Work with our master craftspeople to create a truly unique gift that will be treasured for generations.
            </p>
            <button className="px-8 py-3 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors font-medium">
              Explore Custom Design
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
