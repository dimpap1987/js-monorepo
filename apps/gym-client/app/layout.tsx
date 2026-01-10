import { BodyTemplate } from '@js-monorepo/templates'
import { Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Poppins } from 'next/font/google'
import { ReactNode } from 'react'
import RootComponent from '../components/root-component'
import RootProviders from '../components/root.providers'
import { StructuredData } from '../components/structured-data'
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
          <RootProviders>
            <RootComponent>{children}</RootComponent>
          </RootProviders>
        </NextIntlClientProvider>
      </BodyTemplate>
    </html>
  )
}
