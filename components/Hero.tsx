import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'

interface HeroImage {
  id: string
  title: string
  subtitle: string
  image_url: string
  video_url?: string
  cta_text: string
  cta_link: string
  display_order: number
}

const headingContainer = {
  hidden: { opacity: 0 },
  show: (delay = 0) => ({
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: delay }
  })
}

const headingChild = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const defaultHero: HeroImage = {
  id: 'default',
  title: 'Timeless Elegance',
  subtitle: 'Discover our collection of handcrafted jewelry',
  image_url: 'https://plus.unsplash.com/premium_photo-1723827128433-e22642f03a9e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // edit this value in-code to change the hero image
  video_url: '', // optional: add a video URL (mp4/webm) to use a video background. Use '/videos/name.mp4' for files placed in `public/`.
  cta_text: 'Shop Women',
  cta_link: '/products?gender=women',
  display_order: 0
}

export default function Hero() {
  const reduce = useReducedMotion()
  // Use the in-code `defaultHero`. To use a local video, place it in `public/videos/` and set
  // `defaultHero.video_url = '/videos/your-file.mp4'`.
  const [heroImage] = useState<HeroImage>(defaultHero)

  return (
    <section className="relative h-[60vh] md:h-[85vh] lg:h-[90vh] overflow-hidden bg-[#F8F7F5]">
      {/* Clean hero image */}
      <div className="absolute inset-0">
          {heroImage.video_url ? (
            <video
              src={heroImage.video_url}
              poster={heroImage.image_url || undefined}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectFit: 'cover' }}
              aria-hidden
            />
          ) : heroImage.image_url ? (
            <Image
              src={heroImage.image_url}
              alt={heroImage.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#111827] to-[#374151]" />
          )}
          <div className="absolute inset-0 bg-white/10" />
      </div>

      {/* Text overlay - minimal centered */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-3xl mx-auto text-center">

            <motion.div
              variants={headingContainer}
              initial="hidden"
              animate={reduce ? undefined : 'show'}
              custom={0.1}
              className="mb-6 will-change-transform"
            >
              <motion.h1 
                variants={headingChild} 
                transition={{ duration: 0.7 }} 
                className="text-4xl md:text-6xl lg:text-7xl text-white font-medium tracking-tight mb-4"
              >
                {heroImage.title}
              </motion.h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base md:text-lg text-white mb-6 md:mb-10 max-w-xl mx-auto"
            >
              {heroImage.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              {heroImage.cta_text && (
                <Link
                  href={heroImage.cta_link || '/products'}
                  aria-label={heroImage.cta_text}
                  className="btn btn-primary px-6 sm:px-10 py-3.5 text-sm"
                >
                  {heroImage.cta_text}
                </Link>
              )}

              <Link
                href="/products"
                aria-label="Browse all products"
                className="btn btn-outline px-6 sm:px-10 py-3.5 text-sm text-white border-white hover:bg-white hover:text-[#1A1A1A]"
              >
                Shop Men
              </Link>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
