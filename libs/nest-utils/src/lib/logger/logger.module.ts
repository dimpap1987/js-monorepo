import { DynamicModule, Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export const LOGGER_CONFIG = Symbol('LOGGER_CONFIG')

export interface LoggerConfig {
  /** Log level: 'error' | 'warn' | 'log' | 'debug' | 'verbose'. Default: 'log' */
  level: string
  /** Timezone for timestamps. Default: 'UTC' */
  timezone: string
  /** Whether to use pretty print (colors, formatting). Default: true in dev, false in prod */
  prettyPrint: boolean
  /** Application name shown in logs. Default: 'API' */
  appName: string
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: 'log',
  timezone: 'UTC',
  prettyPrint: process.env['NODE_ENV'] !== 'production',
  appName: 'API',
}

@Global()
@Module({})
export class LoggerModule {
  static forRoot(config?: Partial<LoggerConfig>): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_CONFIG,
          useValue: { ...DEFAULT_CONFIG, ...config },
        },
      ],
      exports: [LOGGER_CONFIG],
    }
  }

  static forRootAsync(): DynamicModule {
    return {
      module: LoggerModule,
      providers: [
        {
          provide: LOGGER_CONFIG,
          useFactory: (configService: ConfigService): LoggerConfig => ({
            level: configService.get<string>('LOGGER_LEVEL') || DEFAULT_CONFIG.level,
            timezone: configService.get<string>('TZ') || DEFAULT_CONFIG.timezone,
            prettyPrint:
              configService.get<string>('LOG_PRETTY_PRINT') === 'true' ||
              configService.get<string>('NODE_ENV') !== 'production',
            appName: configService.get<string>('LOG_APP_NAME') || DEFAULT_CONFIG.appName,
          }),
          inject: [ConfigService],
        },
      ],
      exports: [LOGGER_CONFIG],
    }
  }
}
