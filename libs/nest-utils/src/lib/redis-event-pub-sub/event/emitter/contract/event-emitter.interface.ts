import { PublishableDataInterface } from './publishable-event.interface'

export interface EventEmitterInterface {
  emit(eventName: string, paylod: PublishableDataInterface): void
}
