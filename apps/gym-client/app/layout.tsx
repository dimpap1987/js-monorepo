import { BodyTemplate } from '@js-monorepo/templates'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import RootProviders from '../components/root.providers'
import { StructuredData } from '../components/structured-data'
import { Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { ReactNode } from 'react'
import './global.css'

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '800'],
  variable: '--font-poppins',
  display: 'swap',
  adjustFontFallback: false,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <BodyTemplate className={poppins.className}>
        <StructuredData />
        <NextIntlClientProvider messages={messages}>
          <RootProviders>{children}</RootProviders>
        </NextIntlClientProvider>
      </BodyTemplate>
    </html>
  )
}
