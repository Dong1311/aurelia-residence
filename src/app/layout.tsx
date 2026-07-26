import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { SiteHeader } from '@/components/aurelia/SiteHeader'
import { SiteFooter } from '@/components/aurelia/SiteFooter'
import { SmoothScrollProvider } from '@/components/aurelia/SmoothScrollProvider'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-inter',
})

const DESCRIPTION =
  'Aurelia — House of Light is a coastal residence of 780 m², completed 2026, designed around the changing character of daylight. A scroll-driven architectural study in stone, timber, glass and water.'

export const metadata: Metadata = {
  metadataBase: new URL('https://aurelia.example'),
  title: {
    default: 'Aurelia — House of Light',
    template: '%s · Aurelia',
  },
  description: DESCRIPTION,
  applicationName: 'Aurelia — House of Light',
  authors: [{ name: 'Seawintech' }],
  creator: 'Seawintech',
  publisher: 'Seawintech',
  keywords: [
    'architecture',
    'residence',
    'editorial',
    'scroll experience',
    'coastal residence',
    'house of light',
  ],
  openGraph: {
    type: 'website',
    title: 'Aurelia — House of Light',
    description: DESCRIPTION,
    siteName: 'Aurelia — House of Light',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurelia — House of Light',
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f2eb' },
    { media: '(prefers-color-scheme: dark)', color: '#100f0e' },
  ],
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `data-scroll-behavior` tells the router about the smooth scrolling
    // declared in globals.css, so route transitions are not animated.
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <SmoothScrollProvider>
          <SiteHeader />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
        </SmoothScrollProvider>

        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  )
}
