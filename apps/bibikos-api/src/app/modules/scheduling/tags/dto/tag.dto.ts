import { z } from 'zod'

export interface TagResponseDto {
  id: number
  name: string
}

export const CreateTagSchema = z.object({
  name: z.string().min(1, 'Tag name cannot be empty').max(50),
})

export type CreateTagDto = z.infer<typeof CreateTagSchema>

export const UpdateTagSchema = z.object({
  name: z.string().min(1, 'Tag name cannot be empty').max(50),
})

export type UpdateTagDto = z.infer<typeof UpdateTagSchema>
