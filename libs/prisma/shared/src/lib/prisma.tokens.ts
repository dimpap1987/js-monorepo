/**
 * DI Token for PrismaService injection
 * Apps should provide their own PrismaService implementation using this token
 */
export const PRISMA_SERVICE = Symbol('PRISMA_SERVICE')

/**
 * DI Token for Prisma Module Options
 */
export const PRISMA_MODULE_OPTIONS = 'PRISMA_MODULE_OPTIONS'
