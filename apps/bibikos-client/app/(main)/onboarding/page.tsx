import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { OnboardingContent } from './onboarding-content'

export const metadata: Metadata = generateMetadata({
  title: 'Get Started',
  description: 'Set up your instructor profile to start teaching',
})

export default async function OnboardingPage() {
  return <OnboardingContent />
}
