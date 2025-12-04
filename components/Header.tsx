import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="font-display text-2xl tracking-[0.3em] text-gold hover:text-gold-light transition-colors">
            ATELIER
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <a href="#collection" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Collection</a>
            <a href="#bespoke" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Bespoke</a>
            <a href="#story" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Story</a>
            <a href="#contact" className="ml-4 px-6 py-2.5 text-xs font-medium tracking-wider uppercase bg-gold text-black hover:bg-gold-light transition-all">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  )
}
