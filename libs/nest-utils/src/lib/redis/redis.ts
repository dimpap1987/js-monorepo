import { DynamicModule, Global, Logger, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, RedisClientOptions } from 'redis'

export const REDIS = Symbol('REDIS')

const logger = new Logger('RedisProvider')

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
            const client = createClient(redisOptions)

            client.on('error', (err) => logger.error(`Redis error [${redisOptions.url}]:`, err.stack))

            client.on('ready', () => logger.log(`Redis connected ✅`))

            await client.connect()

            return client
          },
          inject: [...(options.inject ?? []), ConfigService],
        },
      ],
      exports: [REDIS],
    }
  }
}
