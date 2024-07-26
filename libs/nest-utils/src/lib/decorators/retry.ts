import { Logger } from '@nestjs/common'

const LOGGER = new Logger('Retry')

export function Retry(retries: number, timeout = 2000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    let originalError: unknown = null

    descriptor.value = async function (...args: any[]) {
      for (let i = 0; i < retries; i++) {
        try {
          await new Promise((resolve) => setTimeout(resolve, timeout))
          return await originalMethod.apply(this, args)
        } catch (error) {
          const methodName = propertyKey
          const className = target.constructor.name
          LOGGER.error(
            `Retry - Attempt ${i + 1} - ${className} - ${methodName}`
          )
          originalError = error
          timeout *= 2
        }
      }
      if (originalError) throw originalError
    }

    return descriptor
  }
}
