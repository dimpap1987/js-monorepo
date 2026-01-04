import { ContainerTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '../../../lib/seo'
import { ContactPageContent } from './contact-content'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Contact Us',
  description: 'Get in touch with our team. We are here to help with any questions, feedback, or support you need.',
  keywords: ['contact', 'support', 'help', 'feedback', 'questions'],
  type: 'website',
})

export default function ContactPage() {
  return (
    <ContainerTemplate>
      <section className="flex justify-center sm:py-8">
        <div className="w-full max-w-2xl px-4">
          <ContactPageContent />
        </div>
      </section>
    </ContainerTemplate>
  )
}
