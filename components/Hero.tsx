import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useState } from 'react'

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
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 }
}

const defaultHero: HeroImage = {
  id: 'default',
  title: 'Atelier',
  subtitle: '',
  image_url: 'https://images.pexels.com/photos/18658121/pexels-photo-18658121.jpeg?w=1920', // edit this value in-code to change the hero image
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
  // single-line heading + subtitle for a clean Shopify-like look

  return (
    <section className="relative h-screen min-h-[600px] overflow-hidden bg-[#0A0A0A]">
      {/* Background with subtle initial zoom */}
      <motion.div className="absolute inset-0" initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 1.6, ease: 'easeOut' }}>
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
            sizes="100vw"
            quality={85}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A]" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </motion.div>

      {/* Overlay content - Centered Heading Only */}
      <div className="relative h-full flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.995 }}
            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="mx-auto"
          >
            <div className="relative mx-auto w-36 sm:w-48 md:w-56 lg:w-72 xl:w-80 h-auto">
              <img src={encodeURI('/atelier s.svg')} alt={heroImage.title} className="w-full h-auto mx-auto" />
            </div>
          </motion.div>

          <motion.button
            type="button"
            aria-label="Shop now - go to categories"
            onClick={() => {
              const el = typeof document !== 'undefined' ? document.getElementById('categories') : null
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              else window.location.href = '/products'
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 260 }}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 px-3 py-1.5 border border-white/10 rounded-md bg-transparent hover:bg-white/5 mx-auto"
          >
            <span>Shop Now</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4l6 6-6 6" />
            </svg>
          </motion.button>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18 }}
            className="mt-4 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-normal"
          >
            {heroImage.subtitle}
          </motion.p>

          {/* Subtle accent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mt-6 mx-auto w-16 h-[2px] bg-white/15 rounded"
          />
        </div>
      </div>

      {/* Scroll Down Arrow */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 cursor-pointer"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          })
        }}
      >
        <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
