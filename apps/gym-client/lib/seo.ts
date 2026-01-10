// Re-export from shared library
// Make sure site-config is imported first to configure the SEO library
import './site-config'

export { generateMetadata, generateStructuredData, type SEOProps } from '@js-monorepo/seo'
