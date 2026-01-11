import { getCurrentSession } from '@js-monorepo/auth/next/server'
import { BodyTemplate } from '@js-monorepo/templates'
import { Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Poppins } from 'next/font/google'
import { ReactNode } from 'react'
import RootComponent from '../components/root-component'
import { StructuredData } from '../components/structured-data'
import RootProviders from '../providers/root.providers'
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

export default async function RootLayout(props: { readonly children: ReactNode; readonly auth: ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  const session = await getCurrentSession()

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <BodyTemplate className={poppins.className}>
        <StructuredData />
        <NextIntlClientProvider messages={messages}>
          <RootProviders session={session}>
            <RootComponent>
              {props.auth}
              {props.children}
            </RootComponent>
          </RootProviders>
        </NextIntlClientProvider>
      </BodyTemplate>
    </html>
  )
}
