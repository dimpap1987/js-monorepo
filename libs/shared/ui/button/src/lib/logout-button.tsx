import { cn } from '@js-monorepo/utils'
import { forwardRef } from 'react'
import { BiLogOutCircle } from 'react-icons/bi'
import { DpButton } from './button'
export interface DpLogoutButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly className: string
}

const DpLogoutButton = forwardRef<HTMLButtonElement, DpLogoutButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <DpButton
        {...props}
        title="Sign out"
        variant="outline"
        className={cn('flex gap-1 py-2 px-4 w-full', className)}
        ref={ref}
      >
        <BiLogOutCircle className="text-red-600 text-2xl" />
        <span>Sign out</span>
      </DpButton>
    )
  }
)

DpLogoutButton.displayName = 'DpLogoutButton'

export { DpLogoutButton }
