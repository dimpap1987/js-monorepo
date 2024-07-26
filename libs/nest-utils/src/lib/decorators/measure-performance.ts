import { Logger } from '@nestjs/common'

const logger = new Logger('MeasurePerformance')

export function MeasurePerformance(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value

  descriptor.value = function (...args: any[]) {
    const start = performance.now()
    const result = originalMethod.apply(this, args)
    const end = performance.now()

    const methodName = propertyKey
    const className = target.constructor.name

    const seconds = convertMillisToSeconds(end - start)
    logger.debug(
      `${className} - ${methodName} - execution time: '${seconds} seconds'`
    )

    return result
  }

  return descriptor
}

function convertMillisToSeconds(milliseconds: number) {
  return parseFloat((milliseconds / 1000).toFixed(4))
}
