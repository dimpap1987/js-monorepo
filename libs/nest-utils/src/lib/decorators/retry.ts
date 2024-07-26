import { Logger } from '@nestjs/common'

const logger = new Logger('Retry')

export function Retry(retries: number, timeout = 2000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
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
            logger.error(`[${className}] [Retry] - ${methodName}`)
          } else {
            logger.error(
              `[${className}] [Retry] - Attempt ${i} - ${methodName}`
            )
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
