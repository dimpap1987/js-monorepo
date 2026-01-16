import { getCurrentSession } from '@js-monorepo/auth/next/server'
import { generateMetadata } from '@js-monorepo/seo'
import { Metadata } from 'next/types'
import { redirect } from 'next/navigation'
import { OnboardingContent } from './onboarding-content'

export const metadata: Metadata = generateMetadata({
  title: 'Get Started',
  description: 'Set up your instructor profile to start teaching',
})

export default async function OnboardingPage() {
  const session = await getCurrentSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return <OnboardingContent />
}
