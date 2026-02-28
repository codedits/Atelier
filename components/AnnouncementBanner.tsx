import { useState, memo, useEffect } from 'react'
import Link from 'next/link'

interface Announcement {
  text: string
  link?: string
  linkText?: string
  link_text?: string
  icon?: 'sparkle' | 'gift' | 'clock' | 'star'
}

interface AnnouncementBannerProps {
  announcements?: Announcement[]
}

const defaultAnnouncements: Announcement[] = [
  {
    text: 'New Spring Collection Just Dropped',
    link: '/products',
    linkText: 'Shop Now',
    icon: 'sparkle'
  },
  {
    text: 'Complimentary Gift Wrapping on All Orders',
    link: '/products',
    linkText: 'Explore',
    icon: 'gift'
  },
  {
    text: 'Limited Edition — Only 50 Pieces Available',
    link: '/products',
    linkText: 'View Collection',
    icon: 'clock'
  }
]

const icons = {
  sparkle: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  ),
  gift: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  clock: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  star: (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
}

const AnnouncementBanner = memo(function AnnouncementBanner({ announcements = defaultAnnouncements }: AnnouncementBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (announcements.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [announcements.length])

  if (!isVisible) return null

  const current = announcements[currentIndex]

  return (
    <div className="relative bg-[#1A1A1A] text-white overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 announcement-shimmer" />

      <div className="relative flex items-center justify-center py-2.5 px-4">
        <div
          key={currentIndex}
          className="flex items-center gap-3 announcement-slide-in"
        >
          {current.icon && (
            <span className="text-[#C9A96E] flex-shrink-0">
              {icons[current.icon]}
            </span>
          )}
          <span className="text-[11px] sm:text-xs tracking-[0.15em] uppercase font-medium">
            {current.text}
          </span>
          {current.link && (current.linkText || current.link_text) && (
            <Link
              href={current.link}
              className="text-[10px] sm:text-[11px] tracking-[0.15em] uppercase font-semibold text-[#C9A96E] hover:text-[#E0C088] transition-colors underline underline-offset-2 ml-1 flex-shrink-0"
            >
              {current.linkText || current.link_text} →
            </Link>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
          aria-label="Dismiss announcement"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress dots for multiple announcements */}
      {announcements.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-1.5">
          {announcements.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-3 h-[2px] bg-[#C9A96E]' : 'w-1.5 h-[2px] bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
})

export default AnnouncementBanner
