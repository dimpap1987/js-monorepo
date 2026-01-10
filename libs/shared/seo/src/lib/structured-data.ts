import { getSiteConfig } from './site-config'

export type StructuredDataType = 'Organization' | 'WebSite' | 'Article' | 'BreadcrumbList' | 'Product'

export interface OrganizationData {
  logo?: string
  sameAs?: string[]
}

export interface WebSiteData {
  searchUrlTemplate?: string
}

export interface ArticleData {
  headline: string
  image?: string
  datePublished: string
  dateModified?: string
  authorName?: string
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface ProductData {
  name: string
  description?: string
  image?: string
  price?: number
  currency?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
}

type StructuredDataInput = OrganizationData | WebSiteData | ArticleData | { items: BreadcrumbItem[] } | ProductData

/**
 * Generate JSON-LD structured data for SEO.
 *
 * @example
 * ```typescript
 * import { generateStructuredData } from '@js-monorepo/seo'
 *
 * const orgData = generateStructuredData('Organization', {
 *   sameAs: ['https://twitter.com/myapp', 'https://github.com/myapp'],
 * })
 *
 * // In your page:
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(orgData) }}
 * />
 * ```
 */
export function generateStructuredData(type: StructuredDataType, data?: StructuredDataInput): Record<string, unknown> {
  const config = getSiteConfig()

  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  switch (type) {
    case 'Organization': {
      const orgData = data as OrganizationData | undefined
      return {
        ...baseStructuredData,
        name: config.name,
        url: config.url,
        logo: orgData?.logo || `${config.url}/logo.png`,
        sameAs: orgData?.sameAs || [],
      }
    }

    case 'WebSite': {
      const websiteData = data as WebSiteData | undefined
      return {
        ...baseStructuredData,
        name: config.name,
        url: config.url,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: websiteData?.searchUrlTemplate || `${config.url}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }
    }

    case 'Article': {
      const articleData = data as ArticleData
      return {
        ...baseStructuredData,
        headline: articleData.headline,
        image: articleData.image,
        datePublished: articleData.datePublished,
        dateModified: articleData.dateModified || articleData.datePublished,
        author: {
          '@type': 'Person',
          name: articleData.authorName || config.name,
        },
        publisher: {
          '@type': 'Organization',
          name: config.name,
          logo: {
            '@type': 'ImageObject',
            url: `${config.url}/logo.png`,
          },
        },
      }
    }

    case 'BreadcrumbList': {
      const breadcrumbData = data as { items: BreadcrumbItem[] }
      return {
        ...baseStructuredData,
        itemListElement: breadcrumbData.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }
    }

    case 'Product': {
      const productData = data as ProductData
      return {
        ...baseStructuredData,
        name: productData.name,
        description: productData.description,
        image: productData.image,
        ...(productData.price && {
          offers: {
            '@type': 'Offer',
            price: productData.price,
            priceCurrency: productData.currency || 'USD',
            availability: `https://schema.org/${productData.availability || 'InStock'}`,
          },
        }),
      }
    }

    default:
      return baseStructuredData
  }
}
