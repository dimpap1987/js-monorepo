import { Metadata } from 'next'
import { getSiteConfig } from './site-config'

export interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  noindex?: boolean
  nofollow?: boolean
  canonical?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
}

/**
 * Generate Next.js Metadata for SEO.
 * Uses the configured site settings from `configureSite()`.
 *
 * @example
 * ```typescript
 * import { generateMetadata } from '@js-monorepo/seo'
 *
 * export const metadata: Metadata = generateMetadata({
 *   title: 'About Us',
 *   description: 'Learn more about our company',
 *   keywords: ['about', 'company', 'team'],
 * })
 * ```
 */
export function generateMetadata({
  title,
  description,
  keywords,
  image,
  noindex = false,
  nofollow = false,
  canonical,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors,
}: SEOProps): Metadata {
  const config = getSiteConfig()

  const pageTitle = title || config.name
  const fullTitle = title ? `${title} | ${config.name}` : config.name
  const ogImage = image || `${config.url}${config.defaultOgImage || '/og-image.png'}`
  const canonicalUrl = canonical || config.url
  const metaDescription = description || config.description

  return {
    title: pageTitle,
    description: metaDescription,
    keywords,
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale: config.locale || 'en_US',
      url: canonicalUrl,
      siteName: config.name,
      title: fullTitle,
      description: metaDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || config.name,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: metaDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}
