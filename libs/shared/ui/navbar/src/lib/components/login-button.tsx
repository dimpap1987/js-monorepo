import { DpButton } from '@js-monorepo/button'
import { forwardRef } from 'react'
import { BiLogInCircle } from 'react-icons/bi'
import { twMerge } from 'tailwind-merge'

interface DpLoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

const DpLoginButton = forwardRef<HTMLButtonElement, DpLoginButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <DpButton
        {...props}
        title="Sign in"
        variant="accent"
        className={twMerge(
          'gap-1 py-2 px-4 w-full flex justify-center text-white',
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

export default DpLoginButton
