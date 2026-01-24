import { z } from 'zod'

// =============================================================================
// Tag Category DTOs
// =============================================================================

export interface TagCategoryResponseDto {
  id: number
  name: string
  slug: string
}

export const CreateTagCategorySchema = z.object({
  name: z.string().min(1, 'Category name cannot be empty').max(50),
  slug: z
    .string()
    .min(1, 'Slug cannot be empty')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
})

export type CreateTagCategoryDto = z.infer<typeof CreateTagCategorySchema>

export const UpdateTagCategorySchema = z.object({
  name: z.string().min(1, 'Category name cannot be empty').max(50).optional(),
  slug: z
    .string()
    .min(1, 'Slug cannot be empty')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
})

export type UpdateTagCategoryDto = z.infer<typeof UpdateTagCategorySchema>

// =============================================================================
// Tag DTOs
// =============================================================================

// Entity types that a tag can be applied to
export const TAG_ENTITY_TYPES = ['CLASS', 'ORGANIZER', 'LOCATION', 'PARTICIPANT'] as const
export type TagEntityTypeDto = (typeof TAG_ENTITY_TYPES)[number]

const TagEntityTypeSchema = z.enum(TAG_ENTITY_TYPES)

export interface TagResponseDto {
  id: number
  name: string
  category: TagCategoryResponseDto | null
  applicableTo: TagEntityTypeDto[]
}

export const CreateTagSchema = z.object({
  name: z.string().min(1, 'Tag name cannot be empty').max(50),
  categoryId: z.number().int().positive().optional(),
  applicableTo: z.array(TagEntityTypeSchema).optional(),
})

export type CreateTagDto = z.infer<typeof CreateTagSchema>

export const UpdateTagSchema = z.object({
  name: z.string().min(1, 'Tag name cannot be empty').max(50).optional(),
  categoryId: z.number().int().positive().nullish(),
  applicableTo: z.array(TagEntityTypeSchema).optional(),
})

export type UpdateTagDto = z.infer<typeof UpdateTagSchema>
