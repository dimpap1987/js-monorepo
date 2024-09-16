import { PublishableEventInterface } from './contract/publishable-event.interface'

export class NewMessageEvent implements PublishableEventInterface {
  static eventName = 'events:new-message'

  eventName = NewMessageEvent.eventName

  constructor(public readonly data: any) {}
}

export class OnlineUsersEvent<T = any> implements PublishableEventInterface {
  static eventName = 'events:online-users'

  eventName = OnlineUsersEvent.eventName
  public readonly data: T

  constructor(data: T) {
    this.data = data
  }
}
