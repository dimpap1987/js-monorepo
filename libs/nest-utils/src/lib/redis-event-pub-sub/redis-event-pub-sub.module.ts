import { DynamicModule, Logger, Module } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { RedisClientType, createClient } from 'redis'
import { EVENT_EMITTER_TOKEN, RedisEventEmitter } from './event/emitter/redis.event-emitter'
import { EventEmitter2EventSubscriber } from './event/subscriber/event-emitter-2.event-subscriber'
import { EVENT_SUBSCRIBER_TOKEN } from './event/subscriber/event-subscriber.interface'
import { PubSubService } from './pub-sub.service'
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  RedisEventPubSubModuleOptions,
} from './redis-event-pub-sub.module-definition'

export const REDIS_PUB_CLIENT = 'REDIS_PUB_CLIENT'
export const REDIS_SUB_CLIENT = 'REDIS_SUB_CLIENT'
export const REDIS_EVENT_PUB_SUB_REGISTER_EVENT_OPTIONS = 'REDIS_EVENT_PUB_SUB_REGISTER_EVENT_OPTIONS'

const logger = new Logger('RedisEventPubSubModule')

@Module({
  providers: [
    PubSubService,
    {
      provide: REDIS_EVENT_PUB_SUB_REGISTER_EVENT_OPTIONS,
      useFactory: (options: RedisEventPubSubModuleOptions) => options,
      inject: [MODULE_OPTIONS_TOKEN],
    },
    {
      provide: REDIS_PUB_CLIENT,
      useFactory: async (options: RedisEventPubSubModuleOptions) => {
        const client = createClient({
          url: options.url,
        })
        client.on('error', (err) => console.error('Redis Client Error', err))
        await client.connect()
        return client
      },
      inject: [MODULE_OPTIONS_TOKEN],
    },
    {
      provide: EVENT_EMITTER_TOKEN,
      useFactory: (redisPubClient: RedisClientType, eventEmitter: EventEmitter2) => {
        return new RedisEventEmitter(redisPubClient, eventEmitter)
      },
      inject: [REDIS_PUB_CLIENT, EventEmitter2],
    },
    {
      provide: EVENT_SUBSCRIBER_TOKEN,
      useFactory: (eventEmitterSub: EventEmitter2) => {
        return new EventEmitter2EventSubscriber(eventEmitterSub)
      },
      inject: [EventEmitter2],
    },
  ],
  exports: [
    REDIS_PUB_CLIENT,
    EVENT_EMITTER_TOKEN,
    EVENT_SUBSCRIBER_TOKEN,
    REDIS_EVENT_PUB_SUB_REGISTER_EVENT_OPTIONS,
    PubSubService,
  ],
})
export class RedisEventPubSubModule extends ConfigurableModuleClass {
  static registerEvents(eventsPublishableNames: string[]): DynamicModule {
    return {
      module: class {},
      providers: [
        {
          provide: REDIS_SUB_CLIENT,
          useFactory: async (options: RedisEventPubSubModuleOptions, eventEmitter: EventEmitter2) => {
            const client = createClient({
              url: options.url,
            })
            client.on('error', (err: any) => logger.error('Redis Client Error', err))
            await client.connect()
            for (const eventPublishableName of eventsPublishableNames) {
              await client.subscribe(eventPublishableName, (response) => {
                eventEmitter.emit(eventPublishableName, JSON.parse(response))
              })
            }
            return client
          },
          inject: [REDIS_EVENT_PUB_SUB_REGISTER_EVENT_OPTIONS, EventEmitter2],
        },
      ],
    }
  }
}
