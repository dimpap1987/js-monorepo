import { ContainerTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '../../../lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Privacy and Cookie Statement',
  description:
    'Learn about how we collect, use, and protect your personal information. Our privacy policy and cookie statement.',
  keywords: ['privacy', 'cookie policy', 'data protection', 'privacy policy'],
  type: 'website',
  noindex: false, // Legal pages should be indexed
})

function PrivacyCookieStatementPage() {
  return (
    <ContainerTemplate>
      <div className="mt-4">
        <h1>Privacy and Cookie Statement</h1>
      </div>
    </ContainerTemplate>
  )
}

export default PrivacyCookieStatementPage
