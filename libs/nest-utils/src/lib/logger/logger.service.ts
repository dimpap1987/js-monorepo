import { Inject, LoggerService as NestLoggerService, Optional } from '@nestjs/common'
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston'
import { ClsService } from 'nestjs-cls'
import * as winston from 'winston'
import { LOGGER_CONFIG, LoggerConfig } from './logger.module'

type LogLevel = 'error' | 'warn' | 'log' | 'debug' | 'verbose'

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  log: 2,
  debug: 3,
  verbose: 4,
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: 'log',
  timezone: 'UTC',
  prettyPrint: process.env['NODE_ENV'] !== 'production',
  appName: 'API',
}

export class LoggerService implements NestLoggerService {
  private logger: NestLoggerService
  private readonly config: LoggerConfig
  private readonly configuredLevel: number

  constructor(
    @Optional() private readonly cls?: ClsService,
    @Optional() @Inject(LOGGER_CONFIG) config?: LoggerConfig
  ) {
    this.config = config || DEFAULT_CONFIG
    this.configuredLevel = LOG_LEVEL_PRIORITY[this.config.level as LogLevel] ?? LOG_LEVEL_PRIORITY.log

    this.logger = WinstonModule.createLogger({
      levels: winston.config.npm.levels,
      level: this.mapToWinstonLevel(this.config.level),
      format: winston.format.combine(
        winston.format.timestamp({ format: this.getTimestampFormat() }),
        winston.format.json()
      ),
      transports: this.createTransports(),
    })
  }

  log(message: string, context?: string): void {
    if (!this.shouldLog('log')) return
    this.logger.log(this.formatMessage(message), context)
  }

  error(message: string, stack?: string, context?: string): void {
    if (!this.shouldLog('error')) return
    this.logger.error(this.formatMessage(message), this.formatStack(stack), context)
  }

  warn(message: string, context?: string): void {
    if (!this.shouldLog('warn')) return
    this.logger.warn(this.formatMessage(message), context)
  }

  debug(message: string, context?: string): void {
    if (!this.shouldLog('debug')) return
    this.logger.debug?.(this.formatMessage(message), context)
  }

  verbose(message: string, context?: string): void {
    if (!this.shouldLog('verbose')) return
    this.logger.verbose?.(this.formatMessage(message), context)
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] <= this.configuredLevel
  }

  private mapToWinstonLevel(level: string): string {
    const mapping: Record<string, string> = {
      error: 'error',
      warn: 'warn',
      log: 'info',
      debug: 'debug',
      verbose: 'silly',
    }
    return mapping[level] || 'info'
  }

  private getTimestampFormat(): () => string {
    const timezone = this.config.timezone
    return () => {
      return new Date().toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    }
  }

  private createTransports(): winston.transport[] {
    const transports: winston.transport[] = []

    if (this.config.prettyPrint) {
      // Development: Pretty console output
      transports.push(
        new winston.transports.Console({
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.timestamp({ format: this.getTimestampFormat() }),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike(this.config.appName, {
              colors: true,
              prettyPrint: true,
              processId: true,
              appName: true,
            })
          ),
        })
      )
    } else {
      // Production: JSON structured logs (for log aggregation)
      transports.push(
        new winston.transports.Console({
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.timestamp({ format: this.getTimestampFormat() }),
            winston.format.json()
          ),
        })
      )
    }

    return transports
  }

  private formatMessage(message: string): string {
    const sessionId = this.getSessionId()
    if (sessionId) {
      return `${message} [sid:${this.truncateSessionId(sessionId)}]`
    }
    return message
  }

  private formatStack(stack?: string): Record<string, unknown> {
    if (!stack) return {}

    const cleaned = this.stripAnsiCodes(stack)
    return { stack: cleaned }
  }

  private getSessionId(): string | undefined {
    try {
      return this.cls?.get('session-id')
    } catch {
      return undefined
    }
  }

  private truncateSessionId(sessionId: string): string {
    // Extract just the UUID part from signed session (s:uuid.signature)
    const match = sessionId.match(/^s:([^.]+)/)
    if (match) {
      const uuid = match[1]
      return uuid.substring(0, 8) // First 8 chars of UUID
    }
    return sessionId.substring(0, 8)
  }

  private stripAnsiCodes(input: string): string {
    return input.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
  }
}
