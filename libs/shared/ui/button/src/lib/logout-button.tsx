import { cn } from '@js-monorepo/ui/util'
import { forwardRef } from 'react'
import { BiLogOutCircle } from 'react-icons/bi'
import { ButtonProps, DpButton } from './button'

export interface DpLogoutButtonProps extends ButtonProps {
  readonly className?: string
}

const DpLogoutButton = forwardRef<HTMLButtonElement, DpLogoutButtonProps>(({ className, ...props }, ref) => {
  return (
    <DpButton
      variant="danger"
      title="Sign out"
      className={cn(
        'flex items-center gap-3 justify-start w-full px-4 py-2.5 rounded-xl select-none',
        'transition-all duration-200 ease-in-out',
        'hover:shadow-lg hover:shadow-danger/20',
        'focus-visible:ring-danger/50',
        className
      )}
      ref={ref}
      {...props}
    >
      <BiLogOutCircle className="text-xl flex-shrink-0" />
      <span className="font-medium">Sign out</span>
    </DpButton>
  )
})

DpLogoutButton.displayName = 'DpLogoutButton'

export { DpLogoutButton }
