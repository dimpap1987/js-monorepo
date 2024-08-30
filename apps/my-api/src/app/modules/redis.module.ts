import { Global, Logger, Module } from '@nestjs/common'
import { createClient } from 'redis'
export const REDIS = Symbol('AUTH:REDIS')

const logger = new Logger('RedisProvider')

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: async () => {
        const client = createClient({
          url: process.env['REDIS_URL'],
        })

        logger.log(`Creating conenction for redis...`)

        client.on('error', (err) =>
          logger.error(
            `Error while connecting to Redis with url: ${process.env['REDIS_URL']}`
          )
        )

        client.on('ready', () => logger.log(`Connected to Redis successfully`))

        await client.connect() // Connect to Redis
        return client // Return the connected client
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
