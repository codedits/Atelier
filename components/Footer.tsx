export default function Footer() {
  return (
    <footer className="border-t border-[#E5E5E5] bg-[#F8F7F5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-[#E5E5E5]">
          {/* Brand Section */}
          <div>
            <div className="font-display text-lg tracking-[0.05em] text-[#1A1A1A] mb-4">ATELIER</div>
            <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4">
              Handcrafted jewelry since 1987. Luxury, elegance, and timeless beauty.
            </p>
            <p className="text-xs text-[#9CA3AF] mb-3 font-semibold tracking-wider">CONTACT US</p>
            <ul className="space-y-2">
              <li><a href="mailto:hello@atelier.com" className="text-xs text-[#6B6B6B] hover:text-[#D4A5A5] transition-colors">hello@atelier.com</a></li>
              <li><a href="tel:+923001234567" className="text-xs text-[#6B6B6B] hover:text-[#D4A5A5] transition-colors">+92 (300) 123-4567</a></li>
            </ul>
          </div>
          
          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-[#1A1A1A] mb-4 tracking-widest">Shop</h4>
            <ul className="space-y-3">
              <li><a href="/products" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">All Products</a></li>
              <li><a href="/products?category=rings" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">Rings</a></li>
              <li><a href="/products?category=necklaces" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">Necklaces</a></li>
              <li><a href="/products?category=bracelets" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">Bracelets</a></li>
              <li><a href="/products?category=earrings" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">Earrings</a></li>
            </ul>
          </div>
          
          {/* Information */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-[#1A1A1A] mb-4 tracking-widest">Information</h4>
            <ul className="space-y-3">
              <li><a href="/#about" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">About Atelier</a></li>
              <li><a href="/#craftsmanship" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">Craftsmanship</a></li>
              <li><a href="/#journal" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">Journal</a></li>
              <li><a href="/#gift-guide" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">Gift Guide</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-[#1A1A1A] mb-4 tracking-widest">Support</h4>
            <ul className="space-y-3">
              <li><a href="/account" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">My Account</a></li>
              <li><a href="/#shipping" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">Shipping Info</a></li>
              <li><a href="/#returns" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">Returns</a></li>
              <li><a href="/#faq" className="text-sm text-[#6B6B6B] hover:text-[#D4A5A5] hover:translate-x-1 inline-block transition-all duration-200">FAQs</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-[#1A1A1A] mb-4 tracking-widest">Connect</h4>
            <div className="flex gap-3 mb-6">
              <a href="https://instagram.com/atelier" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#6B6B6B] hover:text-[#D4A5A5] hover:border-[#D4A5A5] transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                </svg>
              </a>
              <a href="https://pinterest.com/atelier" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#6B6B6B] hover:text-[#D4A5A5] hover:border-[#D4A5A5] transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://facebook.com/atelier" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#6B6B6B] hover:text-[#D4A5A5] hover:border-[#D4A5A5] transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://twitter.com/atelier" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#6B6B6B] hover:text-[#D4A5A5] hover:border-[#D4A5A5] transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 002.856 2.871c.15.513.25 1.042.25 1.588 0 5.175-3.932 11.143-11.143 11.143-2.215 0-4.287-.661-6.017-1.8.715.08 1.45.123 2.2.123 1.84 0 3.54-.476 5.023-1.298-1.72-.032-3.17-1.17-3.674-2.72.24.037.48.074.729.074.36 0 .71-.046 1.05-.135-1.8-.366-3.15-1.95-3.15-3.85v-.05c.537.305 1.15.476 1.8.5-.73-.487-1.213-1.315-1.213-2.253 0-.5.132-.968.365-1.386 1.94 2.379 4.84 3.95 8.1 4.118-.046-.196-.075-.404-.075-.616 0-2.172 1.765-3.93 3.94-3.93 1.134 0 2.154.476 2.87 1.24.896-.174 1.74-.497 2.497-.94-.293.958-.913 1.764-1.72 2.274.79-.085 1.54-.315 2.237-.63-.53.783-1.2 1.47-1.97 2.02z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@atelier" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-10 h-10 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[#6B6B6B] hover:text-[#D4A5A5] hover:border-[#D4A5A5] transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-2 font-semibold tracking-wider">NEWSLETTER</p>
            <p className="text-xs text-[#6B6B6B]">Subscribe to receive updates and special offers.</p>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="pt-8 space-y-6 md:space-y-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <p className="text-xs text-[#6B6B6B]">© {new Date().getFullYear()} Atelier Fine Jewellery. All rights reserved.</p>
              <div className="flex flex-wrap gap-6">
                <a href="#privacy" className="text-xs text-[#6B6B6B] hover:text-[#D4A5A5] transition-colors">Privacy Policy</a>
                <a href="#terms" className="text-xs text-[#6B6B6B] hover:text-[#D4A5A5] transition-colors">Terms of Service</a>
                <a href="#cookies" className="text-xs text-[#6B6B6B] hover:text-[#D4A5A5] transition-colors">Cookie Policy</a>
              </div>
            </div>
            <div className="text-right w-full md:w-auto">
              <p className="text-xs text-[#6B6B6B] mb-2 font-semibold tracking-wider">ACCEPTED PAYMENTS</p>
              <div className="flex gap-2 justify-end flex-wrap">
                <span className="text-xs text-[#9CA3AF]">Visa</span>
                <span className="text-xs text-[#9CA3AF]">•</span>
                <span className="text-xs text-[#9CA3AF]">Mastercard</span>
                <span className="text-xs text-[#9CA3AF]">•</span>
                <span className="text-xs text-[#9CA3AF]">Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
