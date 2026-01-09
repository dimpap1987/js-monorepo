/**
 * Shared Prisma types that all database implementations must support
 * These are the common models used by shared libraries (auth, notifications, payments, contact)
 */

import * as runtime from '@prisma/client/runtime/client'

/**
 * Re-export Prisma error classes for shared libraries
 */
export const PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError

export const PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError

export const PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError

export const PrismaClientInitializationError = runtime.PrismaClientInitializationError
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError

export const PrismaClientValidationError = runtime.PrismaClientValidationError
export type PrismaClientValidationError = runtime.PrismaClientValidationError

/**
 * Prisma BatchPayload type for bulk operations
 */
export type BatchPayload = { count: number }

/**
 * Prisma namespace-like object for backward compatibility
 * Usage: Prisma.PrismaClientKnownRequestError, Prisma.BatchPayload
 */
export const Prisma = {
  PrismaClientKnownRequestError: runtime.PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError: runtime.PrismaClientUnknownRequestError,
  PrismaClientRustPanicError: runtime.PrismaClientRustPanicError,
  PrismaClientInitializationError: runtime.PrismaClientInitializationError,
  PrismaClientValidationError: runtime.PrismaClientValidationError,
} as const

/**
 * Extend Prisma namespace with type definitions
 * This allows usage like: Prisma.BatchPayload, Prisma.PrismaClientKnownRequestError
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Prisma {
  export type BatchPayload = { count: number }
  export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
}

/**
 * Type for the Prisma object to enable instanceof checks
 */
export type PrismaNamespace = typeof Prisma

/**
 * Base interface for PrismaService that shared libraries depend on
 * Each app (my-api, gym-api) provides its own implementation
 *
 * Note: We use 'any' here intentionally to allow flexible usage across
 * different database implementations. The actual types come from each
 * database's generated Prisma client.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BasePrismaService {
  // Auth models
  authUser: any
  userProfile: any
  provider: any
  role: any
  userRole: any
  unRegisteredUser: any

  // Notification models
  notification: any
  userNotification: any

  // Payment models
  paymentCustomer: any
  subscription: any
  product: any
  price: any
  stripeWebhookEvent: any

  // Contact models
  contactMessage: any

  // Prisma client methods
  $connect(): Promise<void>
  $disconnect(): Promise<void>
}
