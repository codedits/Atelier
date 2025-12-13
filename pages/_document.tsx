import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* DNS prefetch for external resources */}
          <link rel="dns-prefetch" href="https://images.unsplash.com" />
          <link rel="dns-prefetch" href="https://images.pexels.com" />
          <link rel="dns-prefetch" href="https://ctiwaclyvidudekvvizs.supabase.co" />
          
          {/* Preconnect to Google Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* Load only essential font weights with display=swap for faster rendering */}
          <link 
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" 
            rel="stylesheet" 
          />
          
          <meta name="theme-color" content="#030303" />
          
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
