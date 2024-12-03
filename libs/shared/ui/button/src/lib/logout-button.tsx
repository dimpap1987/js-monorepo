import { cn } from '@js-monorepo/ui/util'
import { forwardRef } from 'react'
import { BiLogOutCircle } from 'react-icons/bi'
import { ButtonProps, DpButton } from './button'
export interface DpLogoutButtonProps extends ButtonProps {
  readonly className?: string
}

const DpLogoutButton = forwardRef<HTMLButtonElement, DpLogoutButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <DpButton
        variant="danger"
        title="Sign out"
        className={cn(
          'flex gap-1 py-5 justify-start w-full border rounded-xl select-none',
          className
        )}
        ref={ref}
        {...props}
      >
        <BiLogOutCircle className="text-2xl" />
        <span className="ml-2">Sign out</span>
      </DpButton>
    )
  }
)

DpLogoutButton.displayName = 'DpLogoutButton'

export { DpLogoutButton }
