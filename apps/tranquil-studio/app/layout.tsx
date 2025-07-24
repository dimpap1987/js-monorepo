import { BodyTemplate } from '@js-monorepo/templates'
import { Montserrat } from 'next/font/google'
import MainTemplate from '../components/main-template'
import './global.css'
export const metadata = {
  title: 'Tranquil studio',
}

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
  adjustFontFallback: false,
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <BodyTemplate className={montserrat.className}>
        <MainTemplate>{children}</MainTemplate>
      </BodyTemplate>
    </html>
  )
}
