import { Injectable } from '@nestjs/common'
import { Observable, fromEvent, merge } from 'rxjs'
import { EventEmitter } from 'events'

@Injectable()
export class EventsService {
  private readonly emitter = new EventEmitter()

  subscribe(channel: string | string[]): Observable<any> {
    if (Array.isArray(channel)) {
      // If multiple channels are provided, create an observable for each channel
      const observables = channel?.map((chan) => fromEvent(this.emitter, chan))
      // Merge the observables into a single observable stream
      return merge(...observables)
    } else {
      // If a single channel is provided, create an observable for that channel
      return fromEvent(this.emitter, channel)
    }
  }

  emit(channel: string, data?: object) {
    this.emitter.emit(channel, { data })
  }
}
