export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/5">
          <div>
            <div className="font-display text-xl tracking-[0.3em] text-[#D4AF37] mb-4">ATELIER</div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Crafting timeless elegance since 1987.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs tracking-widest uppercase text-white mb-4">About</h4>
            <ul className="space-y-3">
              <li><a href="#story" className="text-sm text-gray-500 hover:text-[#D4AF37] transition-colors">Our Story</a></li>
              <li><a href="#craftsmanship" className="text-sm text-gray-500 hover:text-[#D4AF37] transition-colors">Craftsmanship</a></li>
              <li><a href="#sustainability" className="text-sm text-gray-500 hover:text-[#D4AF37] transition-colors">Sustainability</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs tracking-widest uppercase text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li><a href="#contact" className="text-sm text-gray-500 hover:text-[#D4AF37] transition-colors">Get in Touch</a></li>
              <li><a href="#faq" className="text-sm text-gray-500 hover:text-[#D4AF37] transition-colors">FAQ</a></li>
              <li><a href="#policies" className="text-sm text-gray-500 hover:text-[#D4AF37] transition-colors">Policies</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs tracking-widest uppercase text-white mb-4">Follow</h4>
            <div className="flex gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 hover:border-[#D4AF37] flex items-center justify-center transition-colors group">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-[#D4AF37] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 hover:border-[#D4AF37] flex items-center justify-center transition-colors group">
                <svg className="w-5 h-5 text-gray-500 group-hover:text-[#D4AF37] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Atelier. Crafted with Elegance.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="text-xs text-gray-600 hover:text-[#D4AF37] transition-colors">Privacy</a>
            <a href="#terms" className="text-xs text-gray-600 hover:text-[#D4AF37] transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
