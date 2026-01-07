import { cn } from '@js-monorepo/ui/util'
import { forwardRef } from 'react'
import { BiLogOutCircle } from 'react-icons/bi'
import { ButtonProps, DpButton } from './button'

export interface DpLogoutButtonProps extends ButtonProps {
  readonly className?: string
}

const DpLogoutButton = forwardRef<HTMLButtonElement, DpLogoutButtonProps>(({ className, ...props }, ref) => {
  return (
    <DpButton variant="primary" title="Sign out" className={cn('w-full rounded-xl', className)} ref={ref} {...props}>
      <BiLogOutCircle className="text-xl flex-shrink-0" />
      <span className="font-medium">Sign out</span>
    </DpButton>
  )
})

DpLogoutButton.displayName = 'DpLogoutButton'

export { DpLogoutButton }
