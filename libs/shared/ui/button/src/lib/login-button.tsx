import { cn } from '@js-monorepo/ui/util'
import { Button, ButtonProps } from '@js-monorepo/components/ui/button'
import { forwardRef } from 'react'
import { BiLogInCircle } from 'react-icons/bi'

interface DpLoginButtonProps extends ButtonProps {
  className?: string
}

const DpLoginButton = forwardRef<HTMLButtonElement, DpLoginButtonProps>(({ className, ...props }, ref) => {
  return (
    <Button
      {...props}
      title="Sign in"
      variant="primary"
      className={cn('gap-1 py-2 px-4 w-full flex justify-center border rounded-xl', className)}
      ref={ref}
    >
      <BiLogInCircle />
      <span>Sign in</span>
    </Button>
  )
})

DpLoginButton.displayName = 'DpLoginButton'

export { DpLoginButton }
