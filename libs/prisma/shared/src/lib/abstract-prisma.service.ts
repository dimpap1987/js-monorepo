import { Inject, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PRISMA_MODULE_OPTIONS } from './prisma.tokens'
import { PrismaModuleOptions } from './prisma.module'

/**
 * Configuration options for the abstract Prisma service
 */
export interface PrismaServiceConfig {
  maxRetries?: number
  retryDelayMs?: number
}

const DEFAULT_CONFIG: Required<PrismaServiceConfig> = {
  maxRetries: 10,
  retryDelayMs: 10000,
}

const delay = (ms: number) => new Promise((resolve) => globalThis.setTimeout(resolve, ms))

/**
 * Abstract base class for PrismaService implementations.
 * Handles connection management, retry logic, and event handling.
 *
 * Each database module (core-db, bibikos-db) should extend this class
 * and provide their specific PrismaClient via createPrismaClient().
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class PrismaService extends AbstractPrismaService<MyPrismaClient> {
 *   protected createPrismaClient(adapter: PrismaPg): MyPrismaClient {
 *     return new PrismaClient({ adapter, ... })
 *   }
 * }
 * ```
 */
export abstract class AbstractPrismaService<TClient extends PrismaClientBase>
  implements OnModuleInit, OnApplicationShutdown
{
  protected readonly logger: Logger
  protected readonly clientName: string
  protected readonly config: Required<PrismaServiceConfig>
  protected pool: Pool
  protected _client: TClient

  constructor(@Inject(PRISMA_MODULE_OPTIONS) protected readonly options: PrismaModuleOptions) {
    this.clientName = options.clientName ?? 'PrismaService'
    this.logger = new Logger(this.clientName)
    this.config = { ...DEFAULT_CONFIG, ...this.getConfig() }
    this.pool = new Pool({ connectionString: options.databaseUrl })
    const adapter = new PrismaPg(this.pool)
    this._client = this.createPrismaClient(adapter)

    // Return a proxy that delegates all PrismaClient calls to the internal client
    return new Proxy(this, {
      get: (target, prop) => {
        if (prop in target) {
          return (target as Record<string | symbol, unknown>)[prop]
        }
        return (target._client as Record<string | symbol, unknown>)[prop]
      },
    })
  }

  /**
   * Override to provide custom configuration.
   * Called during construction before the client is created.
   */
  protected getConfig(): PrismaServiceConfig {
    return {}
  }

  /**
   * Create the PrismaClient instance with the given adapter.
   * Each implementation provides its own generated PrismaClient.
   */
  protected abstract createPrismaClient(adapter: PrismaPg): TClient

  async onModuleInit(): Promise<void> {
    await this.handleDatabaseConnection()
    this.handleEvents()
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    this.logger.warn(`Application shutting down... Signal: ${signal}`)
    await this._client.$disconnect()
    await this.pool.end()
    this.logger.warn('Disconnected from database.')
  }

  private async handleDatabaseConnection(): Promise<void> {
    const { maxRetries, retryDelayMs } = this.config

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this._client.$connect()
        await this._client.$queryRaw`SELECT 1`
        this.logger.log('Connected to database and ping succeeded')
        return
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.stack : String(error)
        this.logger.error(`Database connection attempt ${attempt} failed`, errorMessage)

        if (attempt < maxRetries) {
          this.logger.log(`Retrying connection in ${retryDelayMs / 1000} seconds...`)
          await delay(retryDelayMs)
        } else {
          this.logger.error(`Maximum retry attempts reached (${maxRetries}). Unable to connect to the database.`)
          throw new Error('Failed to connect to the database')
        }
      }
    }
  }

  private handleEvents(): void {
    const showSql = process.env['SHOW_SQL'] === 'true'

    if (showSql) {
      this._client.$on('query', (e: QueryEvent) => {
        this.logger.log(`Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration} ms`)
      })
      this._client.$on('info', (e: LogEvent) => {
        this.logger.log(`Message: ${e.message}`)
      })
    }

    this._client.$on('error', (e: LogEvent) => {
      this.logger.error(`Error Message: ${e.message}`)
    })
  }
}

/**
 * Base interface for PrismaClient that all implementations must satisfy.
 * This defines the minimum required methods for the abstract service.
 */
export interface PrismaClientBase {
  $connect(): Promise<void>
  $disconnect(): Promise<void>
  $queryRaw<T = unknown>(query: TemplateStringsArray, ...values: unknown[]): Promise<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $on(eventType: any, callback: (event: any) => void): any
}

export interface QueryEvent {
  query: string
  params: string
  duration: number
}

export interface LogEvent {
  message: string
}
