// Site configuration
export { configureSite, getSiteConfig, createSiteConfigFromEnv, type SiteConfig } from './lib/site-config'

// Metadata generation
export { generateMetadata, type SEOProps } from './lib/metadata'

// Structured data
export {
  generateStructuredData,
  type StructuredDataType,
  type OrganizationData,
  type WebSiteData,
  type ArticleData,
  type BreadcrumbItem,
  type ProductData,
} from './lib/structured-data'
