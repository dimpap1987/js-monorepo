import { z } from 'zod'

export const locationSchema = z.object({
  name: z.string().min(2, 'Location name is required'),
  countryCode: z.string().min(2, 'Country is required'),
  city: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  isOnline: z.boolean().default(false),
  onlineUrl: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type LocationFormData = z.infer<typeof locationSchema>
