export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/5">
          <div>
            <div className="text-xl tracking-[0.3em] text-gold mb-4">ATELIER</div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Crafting timeless pieces since 1987.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs tracking-widest uppercase text-white mb-4">Collections</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gold transition-colors">Necklaces</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gold transition-colors">Rings</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gold transition-colors">Bracelets</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gold transition-colors">Earrings</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs tracking-widest uppercase text-white mb-4">Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-500 hover:text-gold transition-colors">Bespoke</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gold transition-colors">Restoration</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-gold transition-colors">Care Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs tracking-widest uppercase text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="text-sm text-gray-500">Paris, France</li>
              <li><a href="tel:+33142600000" className="text-sm text-gray-500 hover:text-gold transition-colors">+33 1 42 60 00 00</a></li>
              <li><a href="mailto:contact@atelier.com" className="text-sm text-gray-500 hover:text-gold transition-colors">contact@atelier.com</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Atelier. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gray-600 hover:text-gold transition-colors">Instagram</a>
            <a href="#" className="text-xs text-gray-600 hover:text-gold transition-colors">Pinterest</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
