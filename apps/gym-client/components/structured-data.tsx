import { generateStructuredData } from '../lib/seo'

export function StructuredData() {
  const organizationData = generateStructuredData('Organization')
  const websiteData = generateStructuredData('WebSite')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }} />
    </>
  )
}
