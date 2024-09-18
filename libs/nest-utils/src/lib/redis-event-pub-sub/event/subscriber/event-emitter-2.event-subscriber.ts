import { EventEmitter2 } from '@nestjs/event-emitter'
import { from, map, Observable } from 'rxjs'
import { EventSubscriberInterface } from './event-subscriber.interface'

export class EventEmitter2EventSubscriber implements EventSubscriberInterface {
  constructor(private eventEmitter: EventEmitter2) {}

  on(name: string, listener: any): void {
    this.eventEmitter.on(name, listener)
  }

  off(name: string, listener: any): void {
    this.eventEmitter.removeListener(name, listener)
  }

  private handleWebsocketStream<T = any>(
    socket: any,
    eventName: string
  ): Observable<T> {
    return new Observable((observer) => {
      const dynamicListener = (data: T) => {
        observer.next(data)
      }

      this.on(eventName, dynamicListener)

      socket.on('disconnect', () => {
        this.off(eventName, dynamicListener)
      })
    })
  }

  async createWebsocketStream<T>(
    socket: any,
    eventName: string,
    responseEvent: string
  ): Promise<Observable<{ event: string; data: T }>> {
    const stream$ = this.handleWebsocketStream<T>(socket, eventName)

    return from(stream$).pipe(map((data) => ({ event: responseEvent, data })))
  }
}
