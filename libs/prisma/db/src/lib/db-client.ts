import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name)

  private readonly maxRetries = 10

  private readonly retryDelay = 10000 // 10 seconds

  constructor() {
    super({
      datasourceUrl: process.env.DATABASE_URL,
      errorFormat: 'pretty',
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    })
  }

  async onModuleInit() {
    let retryCount = 0

    while (retryCount < this.maxRetries) {
      try {
        await this.$connect()
        this.logger.log('Connected to database')
        return
      } catch (error) {
        retryCount++
        this.logger.error(
          `Error connecting to database (attempt ${retryCount}/${this.maxRetries})`,
          error.stack
        )

        if (retryCount < this.maxRetries) {
          this.logger.log(
            `Retrying connection in ${this.retryDelay / 1000} seconds...`
          )
          // eslint-disable-next-line @typescript-eslint/no-loop-func
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay))
        }
      }
    }

    this.logger.error(
      'Maximum number of retries reached. Unable to connect to the database.'
    )
    throw new Error('Failed to connect to the database')
  }
}
