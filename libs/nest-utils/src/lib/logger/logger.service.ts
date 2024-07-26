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
      transports: [
        new winston.transports.Console({
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
          level: 'info',
          format: combine(
            timestamp({ format: greeceTimezone }),
            prettyPrint({
              depth: 1,
            })
          ),
        }),
        new winston.transports.File({
          filename: `error-${getCurrentDateFormatted()}.log`,
          level: 'error',
          format: combine(
            timestamp({ format: greeceTimezone }),
            prettyPrint({
              depth: 1,
            })
          ),
        }),
      ],
      levels: winston.config.syslog.levels,
      level: logLevel,
      format: combine(timestamp(), json()),
    })
  }

  log(message: any, fields?: any) {
    this.logger.log(this.toPrettyJson(message, fields))
  }

  error(message: any, fields?: any) {
    this.logger.error(this.toPrettyJson(message, fields))
  }

  warn(message: any, fields?: any) {
    this.logger.warn(this.toPrettyJson(message, fields))
  }

  debug(message: any, fields?: any) {
    this.logger.debug?.(this.toPrettyJson(message, fields))
  }

  verbose(message: any, fields?: any) {
    this.logger.verbose?.(this.toPrettyJson(message, fields))
  }

  private toPrettyJson(message: any, fields?: any) {
    let log: Record<string, any> = {}

    if (typeof message === 'string') {
      log['message'] = message
    } else if (typeof message === 'object') {
      for (const [key, value] of Object.entries(message)) {
        log[key] = value
      }
    }
    if (fields) {
      if (typeof fields === 'object') {
        for (const [key, value] of Object.entries(fields)) {
          log[key] = value
        }
      } else if (typeof fields === 'string') {
        log['context'] = fields
      }
    }
    return log
  }
}
