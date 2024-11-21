import { cn } from '@js-monorepo/ui/util'
import { BackArrow } from './back-arrow'

function BackArrowWithLabel({
  children,
  arrowClassName,
  className,
}: {
  children: React.ReactNode
  arrowClassName?: string
  className?: string
}) {
  return (
    <div className={cn('relative content-center', className)}>
      <BackArrow
        className={cn(
          'absolute top-1/2 left-2 transform -translate-y-1/2',
          arrowClassName
        )}
      ></BackArrow>
      {children}
    </div>
  )
}

export { BackArrowWithLabel }
