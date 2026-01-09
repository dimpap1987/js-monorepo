import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from './prisma/generated/prisma/client'
import { PrismaModuleOptions } from './prisma.module'

// Create a typed PrismaClient with log events enabled
const createPrismaClient = (adapter: PrismaPg) => {
  return new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log: [
      { level: 'query', emit: 'event' },
      { level: 'warn', emit: 'event' },
      { level: 'info', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
  })
}

type PrismaClientWithEvents = ReturnType<typeof createPrismaClient>

const delay = (ms: number) => new Promise((resolve) => globalThis.setTimeout(resolve, ms))

@Injectable()
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class PrismaService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(PrismaService.name)
  private readonly maxRetries = 10
  private readonly retryDelay = 10000 // 10 seconds
  private pool: Pool
  private _client: PrismaClientWithEvents

  constructor(@Inject('PRISMA_MODULE_OPTIONS') private readonly options: PrismaModuleOptions) {
    this.pool = new Pool({ connectionString: options.databaseUrl })
    const adapter = new PrismaPg(this.pool)
    this._client = createPrismaClient(adapter)

    // Return a proxy that delegates all PrismaClient calls to the internal client
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target) {
          return (target as any)[prop]
        }
        return (target._client as any)[prop]
      },
    })
  }

  async onModuleInit() {
    await this.handleDatabaseConnection()
    this.handleEvents()
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.warn(`Application shutting down... Signal: ${signal}`)
    await this._client.$disconnect()
    await this.pool.end()
    this.logger.warn('Disconnected from database.')
  }

  private async handleDatabaseConnection() {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this._client.$connect()

        // Ping database with a lightweight query
        await this._client.$queryRaw`SELECT 1`

        this.logger.log('✅ Connected to database and ping succeeded')
        return // success, exit the loop
      } catch (error: any) {
        this.logger.error(`❌ Database connection attempt ${attempt} failed`, error.stack)

        if (attempt < this.maxRetries) {
          this.logger.log(`Retrying connection in ${this.retryDelay / 1000} seconds...`)
          await delay(this.retryDelay)
        } else {
          this.logger.error(
            `🚨 Maximum retry attempts reached (${this.maxRetries}). Unable to connect to the database.`
          )
          throw new Error('Failed to connect to the database')
        }
      }
    }
  }

  private handleEvents() {
    const showSql = process.env['SHOW_SQL'] === 'true'

    if (showSql) {
      this._client.$on('query', (e) => {
        this.logger.log(`Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration} ms`)
      })
      this._client.$on('info', (e) => {
        this.logger.log(`Message: ${e.message}`)
      })
    }

    this._client.$on('error', (e) => {
      this.logger.error(`Error Message: ${e.message}`)
    })
  }
}

// Type augmentation for PrismaService to include PrismaClient methods
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface PrismaService extends PrismaClientWithEvents {}
