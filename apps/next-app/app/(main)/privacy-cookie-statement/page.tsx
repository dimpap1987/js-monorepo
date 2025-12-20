import { ContainerTemplate } from '@js-monorepo/templates'
import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '../../../lib/seo'
import { SITE_NAME } from '../../../lib/site-config'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Privacy and Cookie Statement',
  description:
    'Learn about how we collect, use, and protect your personal information. Our privacy policy and cookie statement.',
  keywords: ['privacy', 'cookie policy', 'data protection', 'privacy policy'],
  type: 'website',
  noindex: false, // Legal pages should be indexed
})

function PrivacyCookieStatementPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <ContainerTemplate>
      <div className="mt-4 max-w-4xl mx-auto text-foreground">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Privacy and Cookie Statement</h1>
        <p className="text-muted-foreground mb-8">Last updated: {currentDate}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
          <p className="mb-4 text-foreground">
            {SITE_NAME} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
            This Privacy and Cookie Statement explains how we collect, use, disclose, and safeguard your information
            when you use our Service.
          </p>
          <p className="mb-4 text-foreground">
            By using our Service, you agree to the collection and use of information in accordance with this statement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
          <h3 className="text-xl font-semibold mb-3 mt-4 text-foreground">2.1 Information You Provide</h3>
          <p className="mb-4 text-foreground">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>Account registration information (username, email address)</li>
            <li>Profile information you choose to provide</li>
            <li>Communications with us (feedback, support requests)</li>
            <li>Content you submit through the Service</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4 text-foreground">2.2 Information Collected Automatically</h3>
          <p className="mb-4 text-foreground">
            When you use our Service, we automatically collect certain information, including:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>Device information (browser type, operating system)</li>
            <li>Usage data (pages visited, time spent, features used)</li>
            <li>IP address (for security and fraud prevention)</li>
            <li>Session information (to maintain your login state)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. How We Use Your Information</h2>
          <p className="mb-4 text-foreground">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>Provide, maintain, and improve our Service</li>
            <li>Authenticate your identity and manage your account</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, prevent, and address technical issues and security threats</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">4. How We Share Your Information</h2>
          <p className="mb-4 text-foreground">
            We do not sell, trade, or rent your personal information to third parties. We may share your information
            only in the following circumstances:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>
              <strong>Service Providers:</strong> We may share information with third-party service providers who
              perform services on our behalf (e.g., hosting, analytics, payment processing)
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information if required by law or in response to
              valid legal requests
            </li>
            <li>
              <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your
              information may be transferred
            </li>
            <li>
              <strong>With Your Consent:</strong> We may share information with your explicit consent
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Data Security</h2>
          <p className="mb-4 text-foreground">
            We implement appropriate technical and organizational security measures to protect your personal information
            against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>Encryption of data in transit using SSL/TLS</li>
            <li>Secure session management</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication</li>
            <li>Secure data storage</li>
          </ul>
          <p className="mb-4 text-foreground">
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive
            to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Data Retention</h2>
          <p className="mb-4 text-foreground">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this
            Privacy Statement, unless a longer retention period is required or permitted by law. When we no longer need
            your information, we will securely delete or anonymize it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Your Rights and Choices</h2>
          <p className="mb-4 text-foreground">You have the following rights regarding your personal information:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>
              <strong>Access:</strong> You can request access to the personal information we hold about you
            </li>
            <li>
              <strong>Correction:</strong> You can request correction of inaccurate or incomplete information
            </li>
            <li>
              <strong>Deletion:</strong> You can request deletion of your personal information, subject to legal
              obligations
            </li>
            <li>
              <strong>Objection:</strong> You can object to certain processing of your information
            </li>
            <li>
              <strong>Portability:</strong> You can request a copy of your data in a structured, machine-readable format
            </li>
            <li>
              <strong>Withdrawal of Consent:</strong> You can withdraw consent where processing is based on consent
            </li>
          </ul>
          <p className="mb-4 text-foreground">
            To exercise these rights, please contact us through the feedback or support channels provided in the
            Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Cookies and Similar Technologies</h2>
          <h3 className="text-xl font-semibold mb-3 mt-4 text-foreground">8.1 What Are Cookies?</h3>
          <p className="mb-4 text-foreground">
            Cookies are small text files that are placed on your device when you visit a website. They are widely used
            to make websites work more efficiently and provide information to website owners.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4 text-foreground">8.2 How We Use Cookies</h3>
          <p className="mb-4 text-foreground">
            We use cookies <strong>solely for authentication purposes</strong>. Specifically, we use session cookies to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>Maintain your login session</li>
            <li>Remember your authentication state</li>
            <li>Ensure secure access to your account</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3 mt-4 text-foreground">8.3 Types of Cookies We Use</h3>
          <div className="mb-4">
            <p className="mb-2">
              <strong>Essential Authentication Cookies:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
              <li>
                <strong>JSESSIONID:</strong> A session cookie that stores your session identifier. This cookie is
                essential for maintaining your logged-in state and is required for the Service to function properly.
              </li>
              <li>
                <strong>Duration:</strong> Session cookies expire when you close your browser or after 24 hours of
                inactivity, whichever comes first.
              </li>
              <li>
                <strong>Purpose:</strong> Authentication and session management only.
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-4 text-foreground">8.4 Third-Party Cookies</h3>
          <p className="mb-4 text-foreground">
            We <strong>do not use third-party cookies</strong> for advertising, tracking, or analytics purposes. We only
            use cookies that are essential for authentication and session management.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-4 text-foreground">8.5 Managing Cookies</h3>
          <p className="mb-4 text-foreground">
            Most web browsers allow you to control cookies through their settings. However, if you disable cookies, you
            may not be able to access certain features of our Service that require authentication.
          </p>
          <p className="mb-4 text-foreground">To manage cookies in your browser:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>
              <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
            </li>
            <li>
              <strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data
            </li>
            <li>
              <strong>Safari:</strong> Preferences → Privacy → Cookies and website data
            </li>
            <li>
              <strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">9. OAuth Authentication</h2>
          <p className="mb-4 text-foreground">
            When you choose to sign in using OAuth providers (such as Google or GitHub), you will be redirected to the
            provider&apos;s website to authenticate. We only receive the information that the OAuth provider shares with
            us, which typically includes:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground">
            <li>Your email address</li>
            <li>Your name or username</li>
            <li>Profile picture (if provided)</li>
          </ul>
          <p className="mb-4 text-foreground">
            We do not have access to your password or other sensitive information from OAuth providers. Please review
            the privacy policies of these providers to understand how they handle your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Children&apos;s Privacy</h2>
          <p className="mb-4 text-foreground">
            Our Service is not intended for children under the age of 13. We do not knowingly collect personal
            information from children under 13. If you are a parent or guardian and believe your child has provided us
            with personal information, please contact us immediately.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">11. International Data Transfers</h2>
          <p className="mb-4 text-foreground">
            Your information may be transferred to and maintained on computers located outside of your state, province,
            country, or other governmental jurisdiction where data protection laws may differ. By using our Service, you
            consent to the transfer of your information to these facilities.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Changes to This Privacy Statement</h2>
          <p className="mb-4 text-foreground">
            We may update this Privacy and Cookie Statement from time to time. We will notify you of any changes by
            posting the new statement on this page and updating the &quot;Last updated&quot; date. You are advised to
            review this statement periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Contact Us</h2>
          <p className="mb-4 text-foreground">
            If you have any questions about this Privacy and Cookie Statement or our data practices, please contact us
            through the feedback or support channels provided in the Service.
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            By using {SITE_NAME}, you acknowledge that you have read, understood, and agree to this Privacy and Cookie
            Statement.
          </p>
        </div>
      </div>
    </ContainerTemplate>
  )
}

export default PrivacyCookieStatementPage
