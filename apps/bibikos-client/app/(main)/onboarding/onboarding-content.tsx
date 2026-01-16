'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import type { CreateLocationDto } from '@js-monorepo/schemas'
import { useRouter } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'
import { useOrganizer } from '../../../lib/scheduling'
import { ClassStepForm, type ClassFormData } from './components/class-step-form'
import { LocationStepForm } from './components/location-step-form'
import { OnboardingHeader } from './components/onboarding-header'
import { OnboardingProgress } from './components/onboarding-progress'
import { OnboardingStepCard } from './components/onboarding-step-card'
import { ProfileStepForm, type ProfileFormData } from './components/profile-step-form'
import { ONBOARDING_STEPS } from './constants'
import { useOnboardingSubmission } from './hooks/use-onboarding-submission'

export function OnboardingContent() {
  const { session } = useSession()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const [step1Data, setStep1Data] = useState<ProfileFormData | null>(null)
  const [step2Data, setStep2Data] = useState<CreateLocationDto | null>(null) // Location is step 2
  const [step3Data, setStep3Data] = useState<ClassFormData | null>(null) // Class is step 3

  const { data: organizer, isLoading: isOrganizerLoading } = useOrganizer()
  const { submitAllSteps, isSubmitting } = useOnboardingSubmission()

  // Redirect if already has organizer profile
  useEffect(() => {
    if (!isOrganizerLoading && organizer) {
      startTransition(() => {
        router.push('/dashboard')
      })
    }
  }, [isOrganizerLoading, organizer, router])

  // Handle Step 1 Submit - store data and move to next step
  const handleStep1Submit = (data: ProfileFormData) => {
    setStep1Data(data)
    setCurrentStep(2)
  }

  // Handle Step 2 Submit (Location) - store data and move to next step
  const handleStep2Submit = (data: CreateLocationDto) => {
    setStep2Data(data)
    setCurrentStep(3)
  }

  // Handle Step 3 Submit (Class) - create everything at once
  const handleStep3Submit = async (data: ClassFormData) => {
    if (!step1Data || !step2Data) {
      return
    }
    // Create: Organizer → Location → Class (location needed for class)
    // Location is required, so step2Data will always be present
    await submitAllSteps(step1Data, step2Data, data)
  }

  if (isOrganizerLoading) {
    return null
  }

  const currentStepConfig = ONBOARDING_STEPS[currentStep - 1]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-secondary/30 py-2 px-4">
      <div className="max-w-2xl mx-auto">
        <OnboardingHeader />

        <OnboardingProgress steps={ONBOARDING_STEPS} currentStep={currentStep} />

        <OnboardingStepCard step={currentStepConfig}>
          {currentStep === 1 && (
            <ProfileStepForm
              defaultDisplayName={session?.user?.username || ''}
              onSubmit={handleStep1Submit}
              isLoading={isSubmitting}
            />
          )}

          {currentStep === 2 && (
            <LocationStepForm onSubmit={handleStep2Submit} onBack={() => setCurrentStep(1)} isLoading={isSubmitting} />
          )}

          {currentStep === 3 && (
            <ClassStepForm onSubmit={handleStep3Submit} onBack={() => setCurrentStep(2)} isLoading={isSubmitting} />
          )}
        </OnboardingStepCard>
      </div>
    </div>
  )
}
