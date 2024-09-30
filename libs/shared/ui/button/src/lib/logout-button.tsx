import { cn } from '@js-monorepo/ui/util'
import { forwardRef } from 'react'
import { BiLogOutCircle } from 'react-icons/bi'
import { ButtonProps, DpButton } from './button'
export interface DpLogoutButtonProps extends ButtonProps {
  readonly className: string
}

const DpLogoutButton = forwardRef<HTMLButtonElement, DpLogoutButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <DpButton
        {...props}
        title="Sign out"
        variant="accent"
        className={cn('flex gap-1 py-5 justify-start w-full', className)}
        ref={ref}
      >
        <BiLogOutCircle className="text-red-600 text-2xl" />
        <span className="ml-2">Sign out</span>
      </DpButton>
    )
  }
)

DpLogoutButton.displayName = 'DpLogoutButton'

export { DpLogoutButton }
