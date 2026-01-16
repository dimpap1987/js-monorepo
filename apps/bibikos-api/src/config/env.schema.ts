import * as z from 'zod'

/**
 * Schema for validating environment variables.
 * Required variables must be present, while OAuth variables are optional.
 * Empty strings are normalized to undefined before validation (see validateEnv function).
 */
export const envSchema = z.object({
  // Always required
  BIBIKOS_DATABASE_URL: z.string().min(1, 'BIBIKOS_DATABASE_URL is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),
  APP_URL: z.string().url('APP_URL must be a valid URL'),

  // Optional OAuth - Google
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URL: z.string().url('GOOGLE_REDIRECT_URL must be a valid URL').optional(),

  // Optional OAuth - GitHub
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_REDIRECT_URL: z.string().url('GITHUB_REDIRECT_URL must be a valid URL').optional(),

  // Stripe
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Optional configuration
  PORT: z.string().optional(),
  HOST: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  AUTH_LOGIN_REDIRECT: z.string().url('AUTH_LOGIN_REDIRECT must be a valid URL').optional(),
  GRACEFUL_SHUTDOWN_TIMEOUT: z.string().optional(),
})

export type EnvSchema = z.infer<typeof envSchema>

/**
 * Validates environment variables using Zod schema.
 * Transforms empty strings to undefined before validation.
 * @throws {z.ZodError} If validation fails
 */
export function validateEnv(env: Record<string, string | undefined>): EnvSchema {
  // Transform empty strings to undefined for all keys
  const normalizedEnv = Object.fromEntries(
    Object.entries(env).map(([key, value]) => [key, value === '' ? undefined : value])
  )
  return envSchema.parse(normalizedEnv)
}
