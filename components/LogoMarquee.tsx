import { memo } from 'react'

interface LogoMarqueeProps {
  items?: string[]
  speed?: number
}

// Text-based marquee used for social proof / features (no fake partner logos)
const LogoMarquee = memo(function LogoMarquee({
  items = [
    'FREE SHIPPING ACROSS PAKISTAN',
    '100% METAL PURITY',
    'HANDMADE DESIGNS',
    'ECO-FRIENDLY PACKAGING'
  ],
  speed = 18
}: LogoMarqueeProps) {
  const looped = [...items, ...items]

  return (
    <section aria-label="Feature marquee" className="py-4 bg-[#FAFAF8] w-full">
      <div className="w-full overflow-hidden">
        <div className="logo-marquee" style={{ animationDuration: `${speed}s` }}>
          {looped.map((text, i) => (
            <div key={`${text}-${i}`} className="marquee-item">
              <span className="marquee-text">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

export default LogoMarquee
