import { Inject, Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'
import { EventEmitterInterface } from './event/emitter/contract/event-emitter.interface'
import { PublishableDataInterface } from './event/emitter/contract/publishable-event.interface'
import { EVENT_EMITTER_TOKEN } from './event/emitter/redis.event-emitter'
import {
  EVENT_SUBSCRIBER_TOKEN,
  EventSubscriberInterface,
} from './event/subscriber/event-subscriber.interface'

@Injectable()
export class PubSubService {
  constructor(
    @Inject(EVENT_SUBSCRIBER_TOKEN)
    private eventSubscriber: EventSubscriberInterface,
    @Inject(EVENT_EMITTER_TOKEN)
    private readonly eventEmitter: EventEmitterInterface
  ) {}

  on(name: string, listener: any): void {
    this.eventSubscriber.on(name, listener)
  }

  off(name: string, listener: any): void {
    this.eventSubscriber.off(name, listener)
  }

  async emit(
    eventName: string,
    { data, publish = true }: PublishableDataInterface
  ): Promise<void> {
    this.eventEmitter.emit(eventName, { data, publish })
  }

  async createWebsocketStream<T>(
    socket: any,
    eventName: string,
    responseEvent: string
  ): Promise<Observable<{ event: string; data: T }>> {
    return this.eventSubscriber.createWebsocketStream(
      socket,
      eventName,
      responseEvent
    )
  }
}
