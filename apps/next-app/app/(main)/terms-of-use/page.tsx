import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '../../../lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Terms of Use',
  description: 'Read our terms of use agreement. Understand the rules and guidelines for using our service.',
  keywords: ['terms of use', 'terms and conditions', 'user agreement', 'legal'],
  type: 'website',
  noindex: false, // Legal pages should be indexed
})

function TermsOfUsePage() {
  return (
    <div className="mt-4">
      <h1>Terms of Use Agreement</h1>
    </div>
  )
}

export default TermsOfUsePage
