'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import type { CreateLocationDto } from '@js-monorepo/schemas'
import { useRouter } from 'next/navigation'
import { startTransition, useEffect } from 'react'
import { usePersistedState, clearPersistedStates } from '../../../lib/hooks'
import { useOrganizer } from '../../../lib/scheduling'
import { ClassStepForm, type ClassFormData } from './components/class-step-form'
import { LocationStepForm } from './components/location-step-form'
import { OnboardingHeader } from './components/onboarding-header'
import { OnboardingProgress } from './components/onboarding-progress'
import { OnboardingStepCard } from './components/onboarding-step-card'
import { ProfileStepForm, type ProfileFormData } from './components/profile-step-form'
import { ONBOARDING_STEPS, ONBOARDING_STORAGE_KEYS, ALL_ONBOARDING_KEYS } from './constants'
import { useOnboardingSubmission } from './hooks/use-onboarding-submission'

export function OnboardingContent() {
  const { session } = useSession()
  const router = useRouter()

  const [currentStep, setCurrentStep] = usePersistedState(1, {
    key: ONBOARDING_STORAGE_KEYS.STEP,
  })
  const [step1Data, setStep1Data] = usePersistedState<ProfileFormData | null>(null, {
    key: ONBOARDING_STORAGE_KEYS.PROFILE_DATA,
  })
  const [step2Data, setStep2Data] = usePersistedState<CreateLocationDto | null>(null, {
    key: ONBOARDING_STORAGE_KEYS.LOCATION_DATA,
  })
  const [step3Data, setStep3Data] = usePersistedState<ClassFormData | null>(null, {
    key: ONBOARDING_STORAGE_KEYS.CLASS_DATA,
  })

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

  const handleStep1Submit = (data: ProfileFormData) => {
    setStep1Data(data)
    setCurrentStep(2)
  }

  const handleStep2Submit = (data: CreateLocationDto) => {
    setStep2Data(data)
    setCurrentStep(3)
  }

  const handleStep3Submit = async (data: ClassFormData) => {
    if (!step1Data || !step2Data) {
      return
    }

    const success = await submitAllSteps(step1Data, step2Data, data)

    // Clear all persisted onboarding data on success
    if (success) {
      clearPersistedStates(ALL_ONBOARDING_KEYS)
    }
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
              initialData={step1Data}
              onSubmit={handleStep1Submit}
              isLoading={isSubmitting}
            />
          )}

          {currentStep === 2 && (
            <LocationStepForm
              initialData={step2Data}
              onSubmit={handleStep2Submit}
              onBack={() => setCurrentStep(1)}
              isLoading={isSubmitting}
            />
          )}

          {currentStep === 3 && (
            <ClassStepForm
              initialData={step3Data}
              onSubmit={handleStep3Submit}
              onBack={() => setCurrentStep(2)}
              isLoading={isSubmitting}
            />
          )}
        </OnboardingStepCard>
      </div>
    </div>
  )
}
