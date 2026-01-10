import { createPrismaModule } from '@js-monorepo/prisma-shared'
import { PrismaService } from './db-client'

export { PrismaModuleOptions } from '@js-monorepo/prisma-shared'
export const PrismaModule = createPrismaModule(PrismaService)
