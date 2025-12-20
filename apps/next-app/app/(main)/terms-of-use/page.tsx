import { ContainerTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '../../../lib/seo'
import { SITE_NAME } from '../../../lib/site-config'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Terms of Use',
  description: 'Read our terms of use agreement. Understand the rules and guidelines for using our service.',
  keywords: ['terms of use', 'terms and conditions', 'user agreement', 'legal'],
  type: 'website',
  noindex: false, // Legal pages should be indexed
})

function TermsOfUsePage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <ContainerTemplate>
      <div className="mt-4 max-w-4xl mx-auto text-foreground">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Terms of Use</h1>
        <p className="text-muted-foreground mb-8">Last updated: {currentDate}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
          <p className="mb-4 text-foreground">
            By accessing and using {SITE_NAME} (the &ldquo;Service&rdquo;), you accept and agree to be bound by the
            terms and provision of this agreement. If you do not agree to abide by the above, please do not use this
            service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Use License</h2>
          <p className="mb-4 text-foreground">
            Permission is granted to temporarily access the materials on {SITE_NAME} for personal, non-commercial
            transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you
            may not:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on {SITE_NAME}</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or &ldquo;mirror&rdquo; the materials on any other server</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. User Accounts</h2>
          <p className="mb-4 text-foreground">
            To access certain features of the Service, you may be required to create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the security of your password and identification</li>
            <li>Accept all responsibility for activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Acceptable Use</h2>
          <p className="mb-4 text-foreground">You agree not to use the Service to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Transmit any harmful, offensive, or illegal content</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Attempt to gain unauthorized access to any portion of the Service</li>
            <li>Use automated systems to access the Service without permission</li>
            <li>Impersonate any person or entity</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Intellectual Property</h2>
          <p className="mb-4 text-foreground">
            The Service and its original content, features, and functionality are and will remain the exclusive property
            of {SITE_NAME} and its licensors. The Service is protected by copyright, trademark, and other laws. Our
            trademarks and trade dress may not be used in connection with any product or service without our prior
            written consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">6. User Content</h2>
          <p className="mb-4 text-foreground">
            You retain ownership of any content you submit, post, or display on or through the Service. By submitting
            content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and
            distribute such content solely for the purpose of providing and improving the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Third-Party Services</h2>
          <p className="mb-4 text-foreground">
            The Service may contain links to third-party websites or services that are not owned or controlled by{' '}
            {SITE_NAME}. We have no control over, and assume no responsibility for, the content, privacy policies, or
            practices of any third-party websites or services. You acknowledge and agree that {SITE_NAME} shall not be
            responsible or liable for any damage or loss caused by or in connection with the use of any such content,
            goods, or services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Disclaimer</h2>
          <p className="mb-4 text-foreground">
            The information on this Service is provided on an &ldquo;as is&rdquo; basis. To the fullest extent permitted
            by law, {SITE_NAME} excludes all representations, warranties, conditions, and terms relating to our website
            and the use of this website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Limitation of Liability</h2>
          <p className="mb-4 text-foreground">
            In no event shall {SITE_NAME}, nor its directors, employees, partners, agents, suppliers, or affiliates, be
            liable for any indirect, incidental, special, consequential, or punitive damages, including without
            limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the
            Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Indemnification</h2>
          <p className="mb-4 text-foreground">
            You agree to defend, indemnify, and hold harmless {SITE_NAME} and its licensee and licensors, and their
            employees, contractors, agents, officers, and directors, from and against any and all claims, damages,
            obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney&apos;s
            fees).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Termination</h2>
          <p className="mb-4 text-foreground">
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or
            liability, under our sole discretion, for any reason whatsoever and without limitation, including but not
            limited to a breach of the Terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Changes to Terms</h2>
          <p className="mb-4 text-foreground">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is
            material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a
            material change will be determined at our sole discretion.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Governing Law</h2>
          <p className="mb-4 text-foreground">
            These Terms shall be interpreted and governed by the laws of the jurisdiction in which {SITE_NAME} operates,
            without regard to its conflict of law provisions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Contact Information</h2>
          <p className="mb-4 text-foreground">
            If you have any questions about these Terms of Use, please contact us through the feedback or support
            channels provided in the Service.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            By using {SITE_NAME}, you acknowledge that you have read, understood, and agree to be bound by these Terms
            of Use.
          </p>
        </div>
      </div>
    </ContainerTemplate>
  )
}

export default TermsOfUsePage
