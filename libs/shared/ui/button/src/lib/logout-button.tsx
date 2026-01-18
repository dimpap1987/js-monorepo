import { cn } from '@js-monorepo/ui/util'
import { Button, ButtonProps } from '@js-monorepo/components/ui/button'
import { forwardRef } from 'react'
import { BiLogOutCircle } from 'react-icons/bi'

export interface DpLogoutButtonProps extends ButtonProps {
  readonly className?: string
}

const DpLogoutButton = forwardRef<HTMLButtonElement, DpLogoutButtonProps>(({ className, ...props }, ref) => {
  return (
    <Button variant="primary" title="Sign out" className={cn('w-full rounded-xl', className)} ref={ref} {...props}>
      <BiLogOutCircle className="text-xl flex-shrink-0" />
      <span className="font-medium">Sign out</span>
    </Button>
  )
})

DpLogoutButton.displayName = 'DpLogoutButton'

export { DpLogoutButton }
