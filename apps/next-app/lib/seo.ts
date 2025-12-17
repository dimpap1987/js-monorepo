import { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from './site-config'

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
  // Don't add site name to HTML title - let the layout template handle it
  // But add it to Open Graph/Twitter for better social sharing
  const pageTitle = title || SITE_NAME
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const ogImage = image || `${SITE_URL}/og-image.png`
  const canonicalUrl = canonical || SITE_URL

  return {
    title: pageTitle, // Layout template will add site name
    description,
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
      locale: 'en_US',
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: fullTitle, // Full title for social sharing
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title || SITE_NAME,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle, // Full title for social sharing
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export function generateStructuredData(type: 'Organization' | 'WebSite' | 'Article', data: Record<string, any>) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  switch (type) {
    case 'Organization':
      return {
        ...baseStructuredData,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [
          // Add your social media profiles
          // 'https://twitter.com/yourhandle',
          // 'https://github.com/yourusername',
        ],
        ...data,
      }
    case 'WebSite':
      return {
        ...baseStructuredData,
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        ...data,
      }
    case 'Article':
      return {
        ...baseStructuredData,
        headline: data.headline,
        image: data.image,
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
        author: {
          '@type': 'Person',
          name: data.authorName || SITE_NAME,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/logo.png`,
          },
        },
        ...data,
      }
    default:
      return baseStructuredData
  }
}
