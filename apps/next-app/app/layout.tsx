'use client'
import MainTemplate from '../components/main.template'
import './global.css'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-100svh bg-primary">
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
