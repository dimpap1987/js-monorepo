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
    })
  }

  log(message: any, context?: any) {
    this.logger.log(message, context)
  }

  error(message: any, stack: any, context: string) {
    this.logger.error(message, stack, context)
  }

  warn(message: any, context?: any) {
    this.logger.warn(message, context)
  }

  debug(message: any, context?: any) {
    this.logger.debug?.(message, context)
  }

  verbose(message: any, context?: any) {
    this.logger.verbose?.(message, context)
  }

  // private toPrettyJson(message: any, fields?: any) {
  //   let log: Record<string, any> = {}

  //   if (typeof message === 'string') {
  //     log['message'] = message
  //   } else if (typeof message === 'object') {
  //     for (const [key, value] of Object.entries(message)) {
  //       log[key] = value
  //     }
  //   }
  //   if (fields) {
  //     if (typeof fields === 'object') {
  //       for (const [key, value] of Object.entries(fields)) {
  //         log[key] = value
  //       }
  //     } else if (typeof fields === 'string') {
  //       log['context'] = fields
  //     }
  //   }
  //   return log
  // }
}
