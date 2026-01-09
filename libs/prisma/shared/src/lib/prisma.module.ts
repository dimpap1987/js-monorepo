import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common'
import { PRISMA_MODULE_OPTIONS, PRISMA_SERVICE } from './prisma.tokens'

export interface PrismaModuleOptions {
  databaseUrl: string
}

export interface PrismaModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<PrismaModuleOptions> | PrismaModuleOptions
  inject?: any[]
  imports?: any[]
}

/**
 * Abstract module for Prisma integration
 * Apps should use their specific PrismaModule (from core-db or gym-db)
 * This module is used by shared libraries to access the PrismaService token
 */
@Global()
@Module({})
export class PrismaSharedModule {
  /**
   * Register a PrismaService implementation
   * Used by apps to provide their specific PrismaService
   */
  static forFeature(prismaServiceClass: Type<any>): DynamicModule {
    const providers: Provider[] = [
      prismaServiceClass,
      {
        provide: PRISMA_SERVICE,
        useExisting: prismaServiceClass,
      },
    ]

    return {
      module: PrismaSharedModule,
      providers,
      exports: [PRISMA_SERVICE, prismaServiceClass],
    }
  }
}
