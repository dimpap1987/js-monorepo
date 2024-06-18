import dynamic from 'next/dynamic'
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

// Having an issue with hydration error when added Shadcn Dialog. This is a workaround
// https://stackoverflow.com/questions/75094010/nextjs-13-hydration-failed-because-the-initial-ui-does-not-match-what-was-render
const DynamicContextProvider = dynamic(
  () =>
    import('@next-app/components/root.providers').then((mod) => mod.default),
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
      <body
        className={`${poppins.className} flex flex-col min-h-100svh bg-background-primary overflow-hidden`}
      >
        <DynamicContextProvider>
          <MainTemplate>
            {props.auth}
            {props.children}
          </MainTemplate>
        </DynamicContextProvider>
      </body>
    </html>
  )
}
