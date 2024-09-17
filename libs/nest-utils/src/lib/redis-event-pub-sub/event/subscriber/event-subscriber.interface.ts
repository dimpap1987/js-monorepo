import { Observable } from 'rxjs'

export const EVENT_SUBSCRIBER_TOKEN = 'EVENT_SUBSCRIBER_TOKEN'

export interface EventSubscriberInterface {
  on(name: string, listener: any): void

  off(name: string, listener: any): void

  createWebsocketStream<T = any>(
    client: any,
    eventName: string,
    responseEvent: string
  ): Promise<Observable<{ event: string; data: T }>>
}
