import { cn } from '@js-monorepo/ui/util'
import { forwardRef } from 'react'
import { BiLogInCircle } from 'react-icons/bi'
import { ButtonProps, DpButton } from './button'

interface DpLoginButtonProps extends ButtonProps {
  className?: string
}

const DpLoginButton = forwardRef<HTMLButtonElement, DpLoginButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <DpButton
        {...props}
        title="Sign in"
        variant="accent"
        className={cn(
          'gap-1 py-2 px-4 w-full flex justify-center border rounded-xl',
          className
        )}
        ref={ref}
      >
        <BiLogInCircle className="text-green-400 text-2xl" />
        <span>Sign in</span>
      </DpButton>
    )
  }
)

DpLoginButton.displayName = 'DpLoginButton'

export { DpLoginButton }
