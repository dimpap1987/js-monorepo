import { useSession } from '@js-monorepo/auth/next/client'
import { useNotifications } from '@js-monorepo/notification'
import { useCompleteOnboarding } from '../../../../lib/scheduling'
import type { ProfileFormData } from '../components/profile-step-form'
import type { CreateLocationDto } from '@js-monorepo/schemas'
import type { ClassFormData } from '../components/class-step-form'
import { useLoader } from '@js-monorepo/loader'
import { useRouter } from 'next-nprogress-bar'
import { useEffect } from 'react'

export function useOnboardingSubmission() {
  const { session, refreshSession } = useSession()
  const router = useRouter()
  const { addNotification } = useNotifications()
  const { setLoaderState } = useLoader()

  useEffect(() => {
    return () => {
      setLoaderState({
        show: false,
      })
    }
  }, [setLoaderState])

  const completeOnboardingMutation = useCompleteOnboarding()

  const generateSlug = (): string => {
    return session?.user?.username?.toLowerCase().replace(/[^a-z0-9]/g, '-') || ''
  }

  const submitAllSteps = async (
    step1Data: ProfileFormData,
    locationData: CreateLocationDto, // Location (step 3 in UI, but created before class)
    classData: ClassFormData // Class (step 2 in UI) - now required
  ): Promise<boolean> => {
    const slug = generateSlug()

    if (!slug) {
      addNotification({ message: 'Username is required', type: 'error' })
      return false
    }

    try {
      setLoaderState({
        show: true,
      })

      // Single API call to create organizer, location, and class
      await completeOnboardingMutation.mutateAsync({
        organizer: {
          displayName: step1Data.displayName,
          activityLabel: step1Data.activityLabel,
          bio: step1Data.bio || null,
          slug: slug,
        },
        location: {
          name: locationData.name,
          countryCode: locationData.countryCode,
          city: locationData.city || null,
          address: locationData.address || null,
          timezone: locationData.timezone,
          isOnline: locationData.isOnline,
          onlineUrl: locationData.isOnline ? locationData.onlineUrl || null : null,
        },
        class: {
          title: classData.title,
          description: classData.description || null,
          capacity: classData.capacity ? Number(classData.capacity) : null,
          waitlistLimit: classData.waitlistLimit ? Number(classData.waitlistLimit) : null,
        },
      })

      await refreshSession()

      addNotification({
        message: 'Onboarding successfully complete!',
        type: 'success',
        duration: 7000,
      })

      router.push('/dashboard')

      return true
    } catch (error: any) {
      setLoaderState({
        show: false,
      })

      addNotification({
        message: error?.message || 'Failed to complete setup',
        type: 'error',
      })
      return false
    }
  }

  return {
    submitAllSteps,
    isSubmitting: completeOnboardingMutation.isPending,
  }
}
