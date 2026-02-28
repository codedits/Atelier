import { memo } from 'react'

interface LogoMarqueeProps {
  items?: string[]
  speed?: number
}

const LogoMarquee = memo(function LogoMarquee({
  items = [
    'COMPLIMENTARY SHIPPING',
    'CERTIFIED PURITY',
    'HANDCRAFTED DESIGNS',
    'ETHICALLY SOURCED',
    'LIFETIME GUARANTEE'
  ],
  speed = 22
}: LogoMarqueeProps) {
  const looped = [...items, ...items]

  return (
    <section aria-label="Feature marquee" className="py-5 bg-[#FAF9F6] border-t border-b border-[#E8E4DF] w-full">
      <div className="w-full overflow-hidden">
        <div className="logo-marquee" style={{ animationDuration: `${speed}s` }}>
          {looped.map((text, i) => (
            <div key={`${text}-${i}`} className="marquee-item">
              <span className="marquee-text">{text}</span>
              <span className="marquee-separator" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

export default LogoMarquee
