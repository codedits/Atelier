import { Header } from '@/components'
import Footer from '@/components/Footer'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

interface BlogPost {
  id: number
  title: string
  excerpt: string
  date: string
  category: string
  image: string
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'The Art of Jewelry Craftsmanship',
    excerpt: 'Explore the meticulous process behind creating each Atelier piece. From design conception to final polish.',
    date: 'December 10, 2025',
    category: 'Craftsmanship',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop'
  },
  {
    id: 2,
    title: 'Choosing the Perfect Engagement Ring',
    excerpt: 'A comprehensive guide to selecting an engagement ring that reflects your unique style and love story.',
    date: 'December 5, 2025',
    category: 'Guide',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop'
  },
  {
    id: 3,
    title: 'Diamond Quality: Understanding the 4 Cs',
    excerpt: 'Learn about cut, color, clarity, and carat weight. Everything you need to know about diamond quality.',
    date: 'November 28, 2025',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop'
  },
  {
    id: 4,
    title: 'Ethical Sourcing: Our Commitment to Responsible Luxury',
    excerpt: 'Discover how Atelier ensures all materials are ethically sourced and environmentally responsible.',
    date: 'November 20, 2025',
    category: 'Sustainability',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=400&fit=crop'
  },
  {
    id: 5,
    title: 'Jewelry Care Tips: Keep Your Pieces Pristine',
    excerpt: 'Expert advice on how to properly clean, store, and maintain your precious jewelry for years to come.',
    date: 'November 15, 2025',
    category: 'Care',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=400&fit=crop'
  },
  {
    id: 6,
    title: 'Gemstone Guide: Properties and Meanings',
    excerpt: 'A beautiful exploration of different gemstones, their properties, symbolism, and how to choose.',
    date: 'November 8, 2025',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop'
  }
]

export default function Journal() {
  return (
    <>
      <Head>
        <title>Journal | Atelier Fine Jewellery</title>
        <meta name="description" content="Read our journal for insights into jewelry craftsmanship, care tips, gemstone guides, and more." />
        <meta property="og:title" content="Journal | Atelier Fine Jewellery" />
        <meta property="og:description" content="Explore our journal with articles about fine jewelry, craftsmanship, and style." />
      </Head>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl text-[#1A1A1A] mb-6 tracking-tight">
              Journal
            </h1>
            <p className="text-lg text-[#6B6B6B]">
              Stories, insights, and expertise from the world of fine jewelry
            </p>
          </div>
        </section>

        {/* Journal Posts */}
        <section className="py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Featured Post */}
            <div className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
                <div className="relative h-96 rounded-lg overflow-hidden">
                  <Image
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-[#D4A5A5] uppercase tracking-wider">Featured</span>
                    <span className="text-xs text-[#9CA3AF]">•</span>
                    <span className="text-xs text-[#6B6B6B]">{blogPosts[0].category}</span>
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl text-[#1A1A1A] mb-4">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-[#6B6B6B] mb-6 leading-relaxed text-lg">
                    {blogPosts[0].excerpt}
                  </p>
                  <p className="text-sm text-[#9CA3AF] mb-6">{blogPosts[0].date}</p>
                  <button className="px-6 py-3 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors font-medium">
                    Read Article
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of Posts */}
            <div className="border-t border-[#E5E5E5] pt-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {blogPosts.slice(1).map((post) => (
                  <article key={post.id} className="group cursor-pointer">
                    <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-[#D4A5A5] uppercase tracking-wider">{post.category}</span>
                    </div>
                    <h3 className="font-display text-xl text-[#1A1A1A] mb-3 group-hover:text-[#D4A5A5] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[#6B6B6B] text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">{post.date}</p>
                  </article>
                ))}
              </div>
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors font-medium">
                Load More Articles
              </button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-[#F8F7F5] py-16 md:py-24 px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl text-[#1A1A1A] mb-4">
              Stay Updated
            </h2>
            <p className="text-[#6B6B6B] mb-8">
              Subscribe to our newsletter to receive new articles and exclusive insights delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D4A5A5]"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#D4A5A5] transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
