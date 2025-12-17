import { BodyTemplate } from '@js-monorepo/templates'
import RootProviders from '@next-app/components/root.providers'
import { Poppins } from 'next/font/google'
import { Metadata, Viewport } from 'next'
import { ReactNode } from 'react'
import MainTemplate from '../components/main.template'
import { StructuredData } from '../components/structured-data'
import { SITE_CONFIG } from '../lib/site-config'
import './global.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-poppins',
  display: 'swap',
  adjustFontFallback: false,
})

const { name: siteName, url: siteUrl, description: defaultDescription } = SITE_CONFIG

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: ['web app', 'next.js', 'modern application'],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: defaultDescription,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: defaultDescription,
    images: [`${siteUrl}/og-image.png`],
    creator: '@yourtwitterhandle', // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: siteUrl,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default async function RootLayout(props: { readonly children: ReactNode; readonly auth: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <BodyTemplate className={poppins.className}>
        <StructuredData />
        <RootProviders>
          <MainTemplate>
            {props.auth}
            {props.children}
          </MainTemplate>
        </RootProviders>
      </BodyTemplate>
    </html>
  )
}
