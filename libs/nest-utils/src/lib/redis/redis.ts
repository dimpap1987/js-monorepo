import { DynamicModule, Global, Logger, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient, RedisClientOptions } from 'redis'

export const REDIS = Symbol('AUTH:REDIS')

const logger = new Logger('RedisProvider')

interface RedisModuleOptions {
  useFactory: (configService: ConfigService) => Promise<RedisClientOptions>
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
          useFactory: async (configService: ConfigService) => {
            const redisOptions = await options.useFactory(configService)
            const client = createClient(redisOptions)

            logger.log(`Creating connection for Redis...`)

            client.on('error', (err) =>
              logger.error(
                `Error while connecting to Redis with url: ${redisOptions.url}`,
                err.stack
              )
            )

            client.on('ready', () =>
              logger.log(`Connected to Redis successfully`)
            )

            await client.connect()
            return client
          },
          inject: [ConfigService],
        },
      ],
      exports: [REDIS],
    }
  }
}
