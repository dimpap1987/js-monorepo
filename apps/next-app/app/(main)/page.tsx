import { Metadata } from 'next'
import LandingComponent from '../../components/landing.component'
import { generateMetadata as generateSEOMetadata } from '../../lib/seo'
import { SITE_NAME } from '../../lib/site-config'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Home',
  description: `Welcome to ${SITE_NAME} - A modern web application built with Next.js. Discover our features, pricing, and more.`,
  keywords: ['web app', 'next.js', 'modern application', 'saas'],
  type: 'website',
})

export default function LandingPage() {
  return <LandingComponent></LandingComponent>
}
