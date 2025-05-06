import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaModuleOptions } from './prisma.module'

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'>
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name)

  private readonly maxRetries = 10

  private readonly retryDelay = 10000 // 10 seconds

  constructor(@Inject('PRISMA_MODULE_OPTIONS') private readonly options: PrismaModuleOptions) {
    super({
      datasourceUrl: options.databaseUrl,
      errorFormat: 'pretty',
      log: [
        { level: 'query', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    })
  }

  async onModuleInit() {
    await this.handleDatabaseConnection()
    this.handleEvents()
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.warn(`Application shutting down... Signal: ${signal}`)
    await this.$disconnect()
    this.logger.warn('Disconnected from database.')
  }

  private async handleDatabaseConnection() {
    let retryCount = 0

    while (retryCount < this.maxRetries) {
      try {
        await this.$connect()
        this.logger.log('Connected to database')
        return
      } catch (error) {
        retryCount++
        this.logger.error(`Error connecting to database (attempt ${retryCount}/${this.maxRetries})`, error.stack)

        if (retryCount < this.maxRetries) {
          this.logger.log(`Retrying connection in ${this.retryDelay / 1000} seconds...`)
          // eslint-disable-next-line @typescript-eslint/no-loop-func
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay))
        }
      }
    }

    this.logger.error('Maximum number of retries reached. Unable to connect to the database.')
    throw new Error('Failed to connect to the database')
  }

  private handleEvents() {
    const showSql = process.env.SHOW_SQL === 'true'

    if (showSql) {
      this.$on('query', (e: Prisma.QueryEvent) => {
        this.logger.log(`Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration} ms`)
      })
      this.$on('info', (e: Prisma.LogEvent) => {
        this.logger.log(`Message: ${e.message}`)
      })
    }

    this.$on('error', (e: Prisma.LogEvent) => {
      this.logger.error(`Error Message: ${e.message}`)
    })
  }
}
