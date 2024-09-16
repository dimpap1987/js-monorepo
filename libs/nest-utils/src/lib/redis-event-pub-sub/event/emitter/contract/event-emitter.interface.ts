export interface EventEmitterInterface {
  emit(
    eventName: string,
    paylod: {
      eventName: string
      data: any
    }
  ): void
}
