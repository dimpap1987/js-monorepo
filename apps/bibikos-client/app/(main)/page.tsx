import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { AppConfig } from '../../lib/app-config'
import { LandingPage } from './landing-page'

export const metadata: Metadata = generateMetadata({
  title: 'Home',
  description: `${AppConfig.appName} - Simplify your class scheduling. The all-in-one platform for fitness instructors, yoga teachers, and wellness instructors.`,
})

export default function HomePage() {
  return <LandingPage />
}
