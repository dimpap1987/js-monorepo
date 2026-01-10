import { DynamicModule, Global, InjectionToken, Module, OptionalFactoryDependency, Type } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PRISMA_MODULE_OPTIONS, PRISMA_SERVICE } from './prisma.tokens'

export interface PrismaModuleOptions {
  databaseUrl: string
}

export interface PrismaModuleAsyncOptions {
  useFactory: (...args: unknown[]) => Promise<PrismaModuleOptions> | PrismaModuleOptions
  inject?: (InjectionToken | OptionalFactoryDependency)[]
  imports?: unknown[]
}

/**
 * Interface for the dynamic Prisma module with static factory methods
 */
export interface PrismaModuleClass {
  forRoot(options: PrismaModuleOptions): DynamicModule
  forRootAsync(options: PrismaModuleAsyncOptions): DynamicModule
}

/**
 * Factory for creating Prisma modules with consistent configuration.
 * Each database module (core-db, gym-db) uses this to create their module.
 *
 * @example
 * ```typescript
 * import { createPrismaModule } from '@js-monorepo/prisma-shared'
 * import { PrismaService } from './db-client'
 *
 * export const PrismaModule = createPrismaModule(PrismaService)
 * ```
 */
export function createPrismaModule(PrismaServiceClass: Type<unknown>): PrismaModuleClass {
  @Global()
  @Module({})
  class PrismaModule {
    static forRoot(options: PrismaModuleOptions): DynamicModule {
      return {
        module: PrismaModule,
        providers: [
          { provide: PRISMA_MODULE_OPTIONS, useValue: options },
          PrismaServiceClass,
          { provide: PRISMA_SERVICE, useExisting: PrismaServiceClass },
        ],
        exports: [PrismaServiceClass, PRISMA_SERVICE],
      }
    }

    static forRootAsync(options: PrismaModuleAsyncOptions): DynamicModule {
      return {
        module: PrismaModule,
        providers: [
          {
            provide: PRISMA_MODULE_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject ?? [ConfigService],
          },
          PrismaServiceClass,
          { provide: PRISMA_SERVICE, useExisting: PrismaServiceClass },
        ],
        exports: [PrismaServiceClass, PRISMA_SERVICE],
      }
    }
  }

  return PrismaModule
}

/**
 * @deprecated Use createPrismaModule() factory instead
 * Shared module for apps that need to inject PRISMA_SERVICE from shared libraries.
 */
@Global()
@Module({})
export class PrismaSharedModule {
  static forFeature(prismaServiceClass: Type<unknown>): DynamicModule {
    return {
      module: PrismaSharedModule,
      providers: [prismaServiceClass, { provide: PRISMA_SERVICE, useExisting: prismaServiceClass }],
      exports: [PRISMA_SERVICE, prismaServiceClass],
    }
  }
}
