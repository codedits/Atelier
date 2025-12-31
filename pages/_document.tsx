import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Character encoding */}
          <meta charSet="utf-8" />
          
          {/* DNS prefetch for external resources */}
          <link rel="dns-prefetch" href="https://images.unsplash.com" />
          <link rel="dns-prefetch" href="https://images.pexels.com" />
          {process.env.NEXT_PUBLIC_SUPABASE_URL && (
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          )}
          
          {/* Preconnect to Google Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* Load only essential font weights with display=swap for faster rendering */}
          <link 
            href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" 
            rel="stylesheet" 
          />
          
          {/* Theme and appearance */}
          <meta name="theme-color" content="#030303" />
          <meta name="msapplication-TileColor" content="#030303" />
          <meta name="format-detection" content="telephone=no" />
          
          {/* Favicon and app icons */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
          
          {/* SEO: Author and publisher */}
          <meta name="author" content="Atelier Fine Jewellery" />
          <meta name="publisher" content="Atelier" />
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow" />
          
          {/* Preload critical assets */}
          <link rel="preload" href="/atelier%20s.svg" as="image" type="image/svg+xml" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
