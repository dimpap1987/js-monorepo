import { isPromise } from '@js-monorepo/utils/common'
import { Logger } from '@nestjs/common'

const logger = new Logger('MeasurePerformance')

export function MeasurePerformance() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const start = performance.now()
      const response = originalMethod.apply(this, args)

      const result = isPromise(response) ? await response : response

      const end = performance.now()

      const methodName = propertyKey
      const className = target.constructor.name

      const seconds = parseFloat(((end - start) / 1000).toFixed(4))
      logger.debug(`[${className}] - ${methodName}() - execution time: '${seconds} seconds'`)

      return result
    }
    return descriptor
  }
}
