import { CreateLocationSchema, CreateOrganizerSchema } from '@js-monorepo/schemas'
import { z } from 'zod'
import { CreateClassSchema } from '../../classes/dto/class.dto'

export const CompleteOnboardingSchema = z.object({
  organizer: CreateOrganizerSchema,
  location: CreateLocationSchema,
  class: CreateClassSchema.omit({ locationId: true }), // locationId will be set from created location
})

export type CompleteOnboardingDto = z.infer<typeof CompleteOnboardingSchema>
