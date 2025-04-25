'use client'

import { DpButton } from '@js-monorepo/button'
import { ErrorComponent } from '@js-monorepo/error'
import { ThemeProvider } from '@js-monorepo/theme-provider'
import { isObjectDefinedOrEmpty } from '@js-monorepo/utils/common'
import { submitErrors } from '@next-app/actions/submit-error'
import { Poppins } from 'next/font/google'
import { useEffect } from 'react'
import './global.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-poppins',
  display: 'swap',
  adjustFontFallback: false,
})

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    submitErrors(
      JSON.parse(
        JSON.stringify({
          ...(!isObjectDefinedOrEmpty(error) && { error }),
          type: 'Global_Error',
        })
      )
    )
  }, [])

  return (
    <html lang="en">
      <ThemeProvider attribute="class" defaultTheme="system">
        <body
          className={`${poppins.className} flex justify-center container items-center min-h-100svh 
                    bg-background text-foreground overflow-x-hidden`}
        >
          <ErrorComponent type="global" className="container">
            <div className="flex flex-wrap gap-5 mt-5">
              <DpButton className="flex-grow flex-shrink basis-0 min-w-[180px]:" onClick={() => reset()}>
                Try again
              </DpButton>
              <DpButton className="flex-grow flex-shrink basis-0" onClick={() => (window.location.href = '/')}>
                Go to Welcome Page
              </DpButton>
            </div>
          </ErrorComponent>
        </body>
      </ThemeProvider>
    </html>
  )
}
