import { SubscriptionStatus } from '@js-monorepo/types/subscription'
import * as z from 'zod'

/**
 * Valid subscription status values
 */
const validStatuses = Object.values(SubscriptionStatus) as string[]

/**
 * Schema for validating subscription filter query parameters
 */
export const SubscriptionFiltersSchema = z.object({
  status: z
    .enum(validStatuses as [string, ...string[]], {
      errorMap: () => ({ message: `Status must be one of: ${validStatuses.join(', ')}` }),
    })
    .optional()
    .or(z.literal('').transform(() => undefined)),
  search: z
    .union([
      z.string().min(1, 'Search term cannot be empty').max(100, 'Search term cannot exceed 100 characters'),
      z.literal('').transform(() => undefined),
    ])
    .optional(),
  plan: z
    .union([
      z.string().min(1, 'Plan name cannot be empty').max(50, 'Plan name cannot exceed 50 characters'),
      z.literal('').transform(() => undefined),
    ])
    .optional(),
})

export type SubscriptionFiltersType = z.infer<typeof SubscriptionFiltersSchema>

/**
 * Schema for validating all query parameters (pagination + filters)
 */
export const GetAllSubscriptionsQuerySchema = z.object({
  page: z
    .union([z.string().regex(/^\d+$/), z.number(), z.undefined()])
    .transform((val) => (val === undefined ? 1 : typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(z.number().int().min(1)),
  pageSize: z
    .union([z.string().regex(/^\d+$/), z.number(), z.undefined()])
    .transform((val) => (val === undefined ? 10 : typeof val === 'string' ? parseInt(val, 10) : val))
    .pipe(z.number().int().min(1).max(100)),
  status: SubscriptionFiltersSchema.shape.status,
  search: SubscriptionFiltersSchema.shape.search,
  plan: SubscriptionFiltersSchema.shape.plan,
})

export type GetAllSubscriptionsQueryType = z.infer<typeof GetAllSubscriptionsQuerySchema>
