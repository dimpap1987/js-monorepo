import { useSession } from '@js-monorepo/auth/next/client'
import { useNotifications } from '@js-monorepo/notification'
import { useRouter } from 'next/navigation'
import { useCompleteOnboarding } from '../../../../lib/scheduling'
import type { ProfileFormData } from '../components/profile-step-form'
import type { CreateLocationDto } from '@js-monorepo/schemas'
import type { ClassFormData } from '../components/class-step-form'

export function useOnboardingSubmission() {
  const { session, refreshSession } = useSession()
  const router = useRouter()
  const { addNotification } = useNotifications()

  const completeOnboardingMutation = useCompleteOnboarding()

  const generateSlug = (): string => {
    return session?.user?.username?.toLowerCase().replace(/[^a-z0-9]/g, '-') || ''
  }

  const submitAllSteps = async (
    step1Data: ProfileFormData,
    locationData: CreateLocationDto, // Location (step 3 in UI, but created before class)
    classData: ClassFormData // Class (step 2 in UI) - now required
  ) => {
    const slug = generateSlug()

    if (!slug) {
      addNotification({ message: 'Username is required', type: 'error' })
      return
    }

    try {
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

      // Refresh session to get updated organizer data
      await refreshSession()

      // Refresh server components
      router.refresh()

      addNotification({
        message: 'Setup complete! Welcome to ClassOps.',
        type: 'success',
      })

      // Small delay to ensure session is updated before redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    } catch (error: any) {
      addNotification({
        message: error?.message || 'Failed to complete setup',
        type: 'error',
      })
    }
  }

  return {
    submitAllSteps,
    isSubmitting: completeOnboardingMutation.isPending,
  }
}
