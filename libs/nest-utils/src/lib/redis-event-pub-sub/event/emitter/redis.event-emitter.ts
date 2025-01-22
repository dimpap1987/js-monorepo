import { EventEmitter2 } from '@nestjs/event-emitter'
import { RedisClientType } from 'redis'
import { EventEmitterInterface } from './contract/event-emitter.interface'
import { PublishableDataInterface } from './contract/publishable-event.interface'

export const EVENT_EMITTER_TOKEN = 'EVENT_EMITTER_TOKEN'

export class RedisEventEmitter implements EventEmitterInterface {
  constructor(
    private redisPubClient: RedisClientType,
    private eventEmitter: EventEmitter2
  ) {}

  emit(eventName: string, { data, publish = true }: PublishableDataInterface): void {
    if (publish) {
      this.redisPubClient.publish(eventName, JSON.stringify({ data }))
    } else {
      this.eventEmitter.emit(eventName, { data })
    }
  }
}
