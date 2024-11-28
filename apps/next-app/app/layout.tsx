import dynamic from 'next/dynamic'
import { Poppins } from 'next/font/google'
import { ReactNode } from 'react'
import MainTemplate from '../components/main.template'
import './global.css'
import { BodyTemplate } from '@js-monorepo/templates'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-poppins',
  display: 'swap',
  adjustFontFallback: false,
})

const DynamicRootProvicers = dynamic(
  () => import('@next-app/components/root.providers'),
  {
    ssr: false,
  }
)

export default async function RootLayout(props: {
  readonly children: ReactNode
  readonly auth: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <BodyTemplate className={poppins.className}>
        <DynamicRootProvicers>
          <MainTemplate>
            {props.auth}
            {props.children}
          </MainTemplate>
        </DynamicRootProvicers>
      </BodyTemplate>
    </html>
  )
}
