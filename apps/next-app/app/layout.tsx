import { BodyTemplate } from '@js-monorepo/templates'
import RootProviders from '@next-app/components/root.providers'
import { Poppins } from 'next/font/google'
import { ReactNode } from 'react'
import MainTemplate from '../components/main.template'
import './global.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-poppins',
  display: 'swap',
  adjustFontFallback: false,
})

export default async function RootLayout(props: { readonly children: ReactNode; readonly auth: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <BodyTemplate className={poppins.className}>
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
