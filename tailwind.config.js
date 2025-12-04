/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#050505',
        graphite: '#1a1a1a',
        bone: '#f5f5f5',
        slate: '#94a3b8',
        gold: {
          DEFAULT: '#d4af37',
          light: '#e8c547',
          dark: '#b8943d',
        },
      },
      letterSpacing: {
        brand: '0.25em',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
