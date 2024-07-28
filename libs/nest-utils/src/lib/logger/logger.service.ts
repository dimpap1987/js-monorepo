import { getCurrentDateFormatted } from '@js-monorepo/utils'
import { Inject, LoggerService as LS } from '@nestjs/common'
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston'
import * as winston from 'winston'
const { combine, timestamp, json, prettyPrint } = winston.format

const greeceTimezone = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'Europe/Athens',
  })
}

export class LoggerService implements LS {
  private logger: LS

  constructor(@Inject('LOG_LEVEL') private logLevel = 'info') {
    this.logger = WinstonModule.createLogger({
      levels: winston.config.syslog.levels,
      level: logLevel,
      format: combine(timestamp(), json()),
      transports: [
        new winston.transports.Console({
          handleExceptions: true,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('API', {
              colors: true,
              prettyPrint: true,
              processId: true,
              appName: true,
            })
          ),
        }),
        new winston.transports.File({
          filename: `info-${getCurrentDateFormatted()}.log`,
          level: logLevel,
          format: combine(
            timestamp({ format: greeceTimezone }),
            prettyPrint({
              depth: 10,
            })
          ),
        }),
        new winston.transports.File({
          filename: `error-${getCurrentDateFormatted()}.log`,
          level: 'error',
          format: combine(
            timestamp({ format: greeceTimezone }),
            prettyPrint({
              depth: 10,
            })
          ),
        }),
      ],
    })
  }

  log(message: any, context?: any) {
    this.logger.log(message, context)
  }

  error(message: any, stack: any, context: string) {
    this.logger.error('❌ ' + message, this.toPrettyJson(stack), context)
  }

  warn(message: any, context?: any) {
    this.logger.log('[WARNING]⚠️  ' + message, context)
  }

  debug(message: any, context?: any) {
    this.logger.debug?.('🐞 ' + message, context)
  }

  verbose(message: any, context?: any) {
    throw new Error('NOT EXISTING')
  }

  private stripAnsiCodes(input: string): string {
    // Define the regex pattern to match ANSI color codes
    const ansiRegex =
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

    // Use the replace method to remove ANSI codes
    return input.replace(ansiRegex, '')
  }

  private toPrettyJson(message: any, fields?: any) {
    const log: Record<string, any> = {}

    if (typeof message === 'string') {
      log['message'] = this.stripAnsiCodes(message)
    } else if (typeof message === 'object') {
      for (const [key, value] of Object.entries(message)) {
        log[key] =
          typeof value === 'string' ? this.stripAnsiCodes(value) : value
      }
    }
    if (fields) {
      if (typeof fields === 'object') {
        for (const [key, value] of Object.entries(fields)) {
          log[key] =
            typeof value === 'string' ? this.stripAnsiCodes(value) : value
        }
      } else if (typeof fields === 'string') {
        log['context'] =
          typeof fields === 'string' ? this.stripAnsiCodes(fields) : fields
      }
    }
    return log
  }
}
