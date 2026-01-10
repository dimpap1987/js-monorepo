// Tokens
export { PRISMA_SERVICE, PRISMA_MODULE_OPTIONS } from './lib/prisma.tokens'

// Abstract base service
export { AbstractPrismaService, PrismaClientBase, PrismaServiceConfig } from './lib/abstract-prisma.service'

// Module factory and types
export {
  createPrismaModule,
  PrismaSharedModule,
  PrismaModuleOptions,
  PrismaModuleAsyncOptions,
  PrismaModuleClass,
} from './lib/prisma.module'

// Types and Prisma error classes
export {
  Prisma,
  PrismaNamespace,
  BasePrismaService,
  BatchPayload,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from './lib/prisma.types'
