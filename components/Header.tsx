import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="font-display text-2xl tracking-[0.3em] text-[#D4AF37] hover:text-[#C5A572] transition-colors">
            ATELIER
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#men" className="text-sm text-gray-400 hover:text-white transition-colors tracking-wide">Men</a>
            <a href="#women" className="text-sm text-gray-400 hover:text-white transition-colors tracking-wide">Women</a>
            <a href="#collections" className="text-sm text-gray-400 hover:text-white transition-colors tracking-wide">Collections</a>
            <a href="#about" className="text-sm text-gray-400 hover:text-white transition-colors tracking-wide">About</a>
            <a href="#contact" className="ml-4 px-6 py-2.5 text-xs font-medium tracking-wider uppercase bg-[#D4AF37] text-black hover:bg-[#C5A572] transition-all">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  )
}
