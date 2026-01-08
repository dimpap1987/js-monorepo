import { ContactMessageDto } from '@js-monorepo/types/contact'
import { DynamicModule, Global, Module, Provider } from '@nestjs/common'
import { ContactController } from './contact.controller'
import { ContactRepo } from './contact.repository'
import { ContactRepositoryPrisma } from './contact.repository.prisma'
import { ContactService } from './contact.service'

export interface ContactModuleOptions {
  onContactMessageCreated?: (message: ContactMessageDto) => void | Promise<void>
}

const coreProviders: Provider[] = [
  {
    provide: ContactRepo,
    useClass: ContactRepositoryPrisma,
  },
  ContactService,
]

@Global()
@Module({
  controllers: [ContactController],
  providers: [...coreProviders],
  exports: [...coreProviders],
})
export class ContactServerModule {
  /**
   * Static registration with default options
   */
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ContactServerModule,
      providers: [
        {
          provide: 'CONTACT_OPTIONS',
          useValue: {}, // Default empty configuration
        },
        ...coreProviders,
      ],
      controllers: [ContactController],
      exports: [...coreProviders, 'CONTACT_OPTIONS'],
    }
  }

  /**
   * Async registration (e.g., loading options from ConfigService)
   */
  static forRootAsync(options: {
    useFactory?: (...args: any[]) => ContactModuleOptions | Promise<ContactModuleOptions>
    inject?: any[]
    imports?: any[]
  }): DynamicModule {
    // Fix: Ensure useFactory is a function even if options.useFactory is undefined
    const asyncOptionsProvider: Provider = {
      provide: 'CONTACT_OPTIONS',
      useFactory: options.useFactory ?? (() => ({})),
      inject: options.inject ?? [],
    }

    return {
      global: true,
      module: ContactServerModule,
      imports: options.imports || [],
      providers: [asyncOptionsProvider, ...coreProviders],
      controllers: [ContactController],
      exports: [...coreProviders, 'CONTACT_OPTIONS'],
    }
  }
}
