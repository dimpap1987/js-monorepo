import { DynamicModule, Global, Logger, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, RedisClientOptions } from 'redis'

export const REDIS = Symbol('REDIS')

const logger = new Logger('RedisProvider')

type RedisClient = ReturnType<typeof createClient>

export interface ExtendedRedisClient extends RedisClient {
  duplicateClient: () => Promise<RedisClient>
}

export interface RedisModuleOptions {
  useFactory: (...args: any[]) => Promise<RedisClientOptions>
  inject?: any[]
  isGlobal?: boolean
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
            const client = createClient(redisOptions) as ExtendedRedisClient

            client.on('error', (err) => logger.error(`Redis error [${redisOptions.url}]:`, err.stack))

            client.on('ready', () => logger.log(`Redis connected ✅`))

            await client.connect()

            client.duplicateClient = async () => {
              const sub = client.duplicate()
              await sub.connect()
              return sub
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
