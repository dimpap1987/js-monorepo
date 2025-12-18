import { isPromise } from '@js-monorepo/utils/common'
import { Logger } from '@nestjs/common'

const logger = new Logger('Retry')

export function Retry(retries: number, timeout = 2000) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      let lastError: unknown = null

      for (let i = 0; i <= retries; i++) {
        try {
          const result = originalMethod.apply(this, args)
          if (isPromise(result)) {
            // eslint-disable-next-line @typescript-eslint/return-await
            return await result
          }
          return result
        } catch (error: any) {
          lastError = error
          const methodName = propertyKey
          const className = target.constructor.name

          if (i === 0) {
            logger.error(`[${className}] - ${methodName}`, error.stack)
          } else {
            logger.error(`[${className}] - Attempt ${i} - ${methodName}`, error.stack)
          }

          if (i < retries) {
            const currentTimeout = timeout * Math.pow(2, i)
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            await new Promise((resolve) => setTimeout(resolve, currentTimeout))
          }
        }
      }

      throw lastError
    }

    return descriptor
  }
}
