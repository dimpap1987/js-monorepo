import { isPromise } from '@js-monorepo/utils'
import { Logger } from '@nestjs/common'

const logger = new Logger('Catch')

export function Catch(outputWhenError?: any, errorDesciption?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args)
        return isPromise(result) ? await result : result
      } catch (error: any) {
        const methodName = propertyKey
        const className = target.constructor.name
        const errorMessage = errorDesciption
          ? `[${className}] - ${methodName}() - ${errorDesciption}`
          : `[${className}] - ${methodName}()`

        logger.error(errorMessage, error.stack)

        if (outputWhenError === undefined) {
          return
        }
        if (typeof outputWhenError == 'function') {
          return outputWhenError()
        } else {
          return outputWhenError
        }
      }
    }

    return descriptor
  }
}
