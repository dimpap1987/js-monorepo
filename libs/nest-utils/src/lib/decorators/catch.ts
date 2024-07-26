import { Logger } from '@nestjs/common'

const logger = new Logger('Catch')

export function Catch<T>(outputWhenError?: T, errorDesciption?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        const methodName = propertyKey
        const className = target.constructor.name
        const errorMessage = errorDesciption
          ? `[${className}] [Catch]- ${methodName}() - ${errorDesciption}`
          : `[${className}] [Catch] - ${methodName}()`

        logger.error(errorMessage, error)
        if (outputWhenError === undefined) {
          return
        } else {
          return outputWhenError
        }
      }
    }

    return descriptor
  }
}
