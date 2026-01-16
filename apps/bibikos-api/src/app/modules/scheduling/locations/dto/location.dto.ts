import {
  CreateLocationSchema,
  UpdateLocationSchema,
  type CreateLocationDto,
  type UpdateLocationDto,
} from '@js-monorepo/schemas'

// Re-export for backward compatibility
export { CreateLocationSchema, UpdateLocationSchema, type CreateLocationDto, type UpdateLocationDto }

export interface LocationResponseDto {
  id: number
  name: string
  countryCode: string
  city: string | null
  address: string | null
  timezone: string
  isOnline: boolean
  onlineUrl: string | null
  isActive: boolean
  createdAt: Date
}
