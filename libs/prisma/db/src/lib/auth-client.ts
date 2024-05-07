/* eslint-disable import/no-extraneous-dependencies */
import { PrismaClient as AuthPrismaClient } from '@db/prisma-auth/client'
import { PrismaClient } from '@prisma/client'

// Auth Prisma client singleton function
const authPrismaClientSingleton = () => {
  return new AuthPrismaClient()
}

// Initialize the Auth Prisma client
const authClient: PrismaClient =
  globalThis.authClient ?? authPrismaClientSingleton()

export { authClient }

// Store Prisma clients in global scope in development mode
if (process.env.NODE_ENV !== 'production') {
  globalThis.authClient = authClient
}
