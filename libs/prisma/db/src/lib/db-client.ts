/* eslint-disable import/no-extraneous-dependencies */
import { PrismaClient } from '@prisma/client'

// Auth Prisma client singleton function
const prismaClientSingleton = () => {
  return new PrismaClient()
}

// Initialize the Auth Prisma client
const prismaClient: PrismaClient =
  globalThis.prismaClient ?? prismaClientSingleton()

export { prismaClient }

// Store Prisma clients in global scope in development mode
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaClient = prismaClient
}
