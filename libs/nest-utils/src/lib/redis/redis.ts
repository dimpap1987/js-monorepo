import { DynamicModule, Global, Logger, Module } from '@nestjs/common'
import { createClient, RedisClientOptions } from 'redis'

export const REDIS = Symbol('AUTH:REDIS')

const logger = new Logger('RedisProvider')

@Global()
@Module({})
export class RedisModule {
  static register(options: RedisClientOptions): DynamicModule {
    return {
      module: RedisModule,
      providers: [
        {
          provide: REDIS,
          useFactory: async () => {
            const client = createClient(options)

            logger.log(`Creating connection for Redis...`)

            client.on('error', (err) =>
              logger.error(
                `Error while connecting to Redis with url: ${options?.url}`,
                err.stack
              )
            )

            client.on('ready', () =>
              logger.log(`Connected to Redis successfully`)
            )

            await client.connect()
            return client
          },
        },
      ],
      exports: [REDIS],
    }
  }
}
