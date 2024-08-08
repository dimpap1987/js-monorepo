import { isPromise } from '@js-monorepo/utils/common'
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
          const result = originalMethod.apply(this, args)
          // eslint-disable-next-line @typescript-eslint/return-await
          return isPromise(result) ? await result : result
        } catch (error: any) {
          originalError = error
          const methodName = propertyKey
          const className = target.constructor.name
          if (i == 0) {
            logger.error(`[${className}] - ${methodName}`, error.stack)
          } else {
            logger.error(
              `[${className}] - Attempt ${i} - ${methodName}`,
              error.stack
            )
          }
          if (i < retries) {
            const currentTimeout = timeout * Math.pow(2, i) // Exponential backoff
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            await new Promise((resolve) => setTimeout(resolve, currentTimeout))
          }
        }
      }
      if (originalError) throw originalError
    }

    return descriptor
  }
}
