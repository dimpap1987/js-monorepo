import { DynamicModule, Global, Logger, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, RedisClientOptions } from 'redis'

export const REDIS = Symbol('REDIS')

const logger = new Logger('RedisProvider')

export interface RedisModuleOptions {
  useFactory: (...args: any[]) => Promise<RedisClientOptions>
  inject?: any[]
  isGlobal?: boolean
  clientName?: string | ((...args: any[]) => Promise<string> | string)
}

/**
 * Resolves the client name from the options
 */
async function resolveClientName(
  clientNameOption: string | ((...args: any[]) => Promise<string> | string) | undefined,
  args: any[]
): Promise<string | null> {
  if (!clientNameOption) {
    return null
  }

  if (typeof clientNameOption === 'function') {
    return clientNameOption(...args)
  }

  return clientNameOption
}

/**
 * Sets the Redis client name for connection tracking
 */
async function setClientName(
  client: { sendCommand: (command: string[]) => Promise<unknown> },
  clientName: string
): Promise<void> {
  try {
    await client.sendCommand(['CLIENT', 'SETNAME', clientName])
    logger.log(`Redis client name set: ${clientName}`)
  } catch (error: any) {
    logger.warn(`Failed to set Redis client name: ${error?.message}`)
  }
}

@Global()
@Module({})
export class RedisModule {
  static forRootAsync(options: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      global: options.isGlobal || false,
      providers: [
        {
          provide: REDIS,
          useFactory: async (...args: any[]) => {
            const redisOptions = await options.useFactory(...args)
            const client = createClient(redisOptions)

            client.on('error', (err) => logger.error(`Redis error [${redisOptions.url}]:`, err.stack))
            client.on('ready', () => logger.log(`Redis connected ✅`))

            await client.connect()

            if (options.clientName) {
              const clientName = await resolveClientName(options.clientName, args)
              if (clientName) {
                await setClientName(client, clientName)
              }
            }
            return client
          },
          inject: [...(options.inject ?? []), ConfigService],
        },
      ],
      exports: [REDIS],
    }
  }
}
