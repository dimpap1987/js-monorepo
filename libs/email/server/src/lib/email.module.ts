import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EmailService } from './email.service'
import { EMAIL_MODULE_OPTIONS, EMAIL_PROVIDER, EMAIL_TEMPLATE_ENGINE } from './email.tokens'
import { EmailModuleAsyncOptions, EmailModuleOptions } from './email.types'
import { ConsoleEmailProvider, EmailProvider, SendGridEmailProvider, SmtpEmailProvider } from './providers'
import { EmailTemplateService, TemplateEngine } from './templates'

function createProviderFactory(options: EmailModuleOptions): Type<EmailProvider> {
  switch (options.provider) {
    case 'smtp':
      return SmtpEmailProvider
    case 'sendgrid':
      return SendGridEmailProvider
    case 'console':
    default:
      return ConsoleEmailProvider
  }
}

const coreProviders: Provider[] = [EmailService, EmailTemplateService]

@Global()
@Module({})
export class EmailModule {
  static forRoot(options: EmailModuleOptions): DynamicModule {
    const ProviderClass = createProviderFactory(options)

    return {
      global: true,
      module: EmailModule,
      providers: [
        {
          provide: EMAIL_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: EMAIL_PROVIDER,
          useClass: ProviderClass,
        },
        ...coreProviders,
      ],
      exports: [EMAIL_MODULE_OPTIONS, EMAIL_PROVIDER, ...coreProviders],
    }
  }

  static forRootAsync(options: EmailModuleAsyncOptions): DynamicModule {
    return {
      global: true,
      module: EmailModule,
      imports: [...(options.imports ?? [])],
      providers: [
        {
          provide: EMAIL_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: [...(options.inject ?? []), ConfigService],
        },
        {
          provide: EMAIL_PROVIDER,
          useFactory: (moduleOptions: EmailModuleOptions) => {
            const ProviderClass = createProviderFactory(moduleOptions)
            return new ProviderClass(moduleOptions)
          },
          inject: [EMAIL_MODULE_OPTIONS],
        },
        ...coreProviders,
      ],
      exports: [EMAIL_MODULE_OPTIONS, EMAIL_PROVIDER, ...coreProviders],
    }
  }

  static withTemplateEngine(options: EmailModuleOptions, templateEngine: TemplateEngine): DynamicModule {
    const ProviderClass = createProviderFactory(options)

    return {
      global: true,
      module: EmailModule,
      providers: [
        {
          provide: EMAIL_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: EMAIL_PROVIDER,
          useClass: ProviderClass,
        },
        {
          provide: EMAIL_TEMPLATE_ENGINE,
          useValue: templateEngine,
        },
        ...coreProviders,
      ],
      exports: [EMAIL_MODULE_OPTIONS, EMAIL_PROVIDER, EMAIL_TEMPLATE_ENGINE, ...coreProviders],
    }
  }
}
