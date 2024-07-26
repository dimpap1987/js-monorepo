import { Logger } from '@nestjs/common'

// const LOGGER = new Logger('Retry')

export function Retry(retries: number, timeout = 2000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const logger = new Logger(`${target.constructor.name}-Retry`);
    let originalError: unknown = null

    descriptor.value = async function (...args: any[]) {
      for (let i = 0; i <= retries; i++) {
        try {
          return await originalMethod.apply(this, args)
        } catch (error) {
          originalError = error
          const methodName = propertyKey
          const className = target.constructor.name
          if (i == 0) {
            logger.error(`Retry - ${className} - ${methodName}`)
          } else {
            logger.error(`Retry - Attempt ${i} - ${className} - ${methodName}`)
          }
          if (i < retries) {
            // dont wait on the last retry
            await new Promise((resolve) => setTimeout(resolve, timeout))
            timeout *= 2
          }
        }
      }
      if (originalError) throw originalError
    }

    return descriptor
  }
}
