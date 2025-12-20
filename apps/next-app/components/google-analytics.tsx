'use client'

import { isCookieCategoryEnabled, COOKIE_CATEGORY_IDS } from '@js-monorepo/components/cookie-banner'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function GoogleAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (!isCookieCategoryEnabled(COOKIE_CATEGORY_IDS.METRICS)) {
      return
    }

    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    if (!measurementId) {
      console.warn('Google Analytics: NEXT_PUBLIC_GA_MEASUREMENT_ID is not set')
      return
    }

    if (typeof window === 'undefined') return

    if (!window.dataLayer) {
      window.dataLayer = []
    }

    if (!window.gtag) {
      const gtag = (...args: any[]) => {
        window.dataLayer.push(args)
      }
      window.gtag = gtag
      gtag('js', new Date())
    }

    window.gtag('config', measurementId, {
      page_path: pathname,
    })

    if (!document.querySelector(`script[src*="gtag/js?id=${measurementId}"]`)) {
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      script.async = true
      document.head.appendChild(script)
    }
  }, [pathname])

  return null
}

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
