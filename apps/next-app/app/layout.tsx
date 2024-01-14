import { Poppins } from 'next/font/google'
import MainTemplate from '../components/main.template'
import './global.css'
import { PageProgressBar } from '@js-monorepo/page-progress-bar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nextjs App',
}

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['200'],
  variable: '--font-poppins',
  display: 'swap',
  adjustFontFallback: false,
})

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} flex flex-col min-h-100svh bg-background`}
        suppressHydrationWarning={true}
      >
        <PageProgressBar>
          <MainTemplate>{children}</MainTemplate>
        </PageProgressBar>
      </body>
    </html>
  )
}
