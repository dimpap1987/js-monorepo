import { DynamicModule, Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PRISMA_SERVICE } from '@js-monorepo/prisma-shared'
import { PrismaService } from './db-client'

export interface PrismaModuleOptions {
  databaseUrl: string
}

@Global()
@Module({})
export class PrismaModule {
  static forRoot(options: PrismaModuleOptions): DynamicModule {
    return {
      module: PrismaModule,
      providers: [
        { provide: 'PRISMA_MODULE_OPTIONS', useValue: options },
        PrismaService,
        { provide: PRISMA_SERVICE, useExisting: PrismaService },
      ],
      exports: [PrismaService, PRISMA_SERVICE],
    }
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<PrismaModuleOptions> | PrismaModuleOptions
    inject?: any[]
  }): DynamicModule {
    return {
      module: PrismaModule,
      providers: [
        {
          provide: 'PRISMA_MODULE_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [ConfigService],
        },
        PrismaService,
        { provide: PRISMA_SERVICE, useExisting: PrismaService },
      ],
      exports: [PrismaService, PRISMA_SERVICE],
    }
  }
}
