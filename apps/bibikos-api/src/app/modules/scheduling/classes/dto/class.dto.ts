import { CreateClassSchema, UpdateClassSchema, type CreateClassDto, type UpdateClassDto } from '@js-monorepo/schemas'

// Re-export for backward compatibility
export { CreateClassSchema, UpdateClassSchema, type CreateClassDto, type UpdateClassDto }

export interface ClassResponseDto {
  id: number
  organizerId: number
  locationId: number
  title: string
  description: string | null
  capacity: number | null
  waitlistLimit: number | null
  isCapacitySoft: boolean
  isActive: boolean
  createdAt: Date
  location?: {
    id: number
    name: string
    timezone: string
    isOnline: boolean
  }
}

export interface ClassListResponseDto {
  classes: ClassResponseDto[]
  total: number
}
