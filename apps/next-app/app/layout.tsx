'use client'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'
import { Poppins } from 'next/font/google'
import MainTemplate from '../components/main.template'
import './global.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-poppins',
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
        <MainTemplate>{children}</MainTemplate>
        <ProgressBar
          height="2px"
          color="#fffd00"
          options={{ showSpinner: false }}
          shallowRouting
        />
      </body>
    </html>
  )
}
