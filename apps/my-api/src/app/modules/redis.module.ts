import { Global, Logger, Module } from '@nestjs/common'
import { createClient } from 'redis'
export const REDIS = Symbol('AUTH:REDIS')

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: async () => {
        const client = createClient({
          url: process.env['REDIS_URL'],
        })

        client.on('error', (err) =>
          Logger.error(
            `Error while connecting to Redis with url: ${process.env['REDIS_URL']}`
          )
        )
        client.on('ready', () => Logger.log(`Connected to Redis successfully`))
        await client.connect() // Connect to Redis
        Logger.log(`Creating conenction for redis 2`)
        return client // Return the connected client
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
