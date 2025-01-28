import { cn } from '@js-monorepo/ui/util'
import { PropsWithChildren } from 'react'

interface SectionWrapperProps extends PropsWithChildren, React.HTMLProps<HTMLElement> {
  className?: string
}

export const SectionWrapper = ({ children, className, ...rest }: SectionWrapperProps) => {
  return (
    <section {...rest} className={cn('py-5 px-6 rounded-md bg-white', className)}>
      {children}
    </section>
  )
}
