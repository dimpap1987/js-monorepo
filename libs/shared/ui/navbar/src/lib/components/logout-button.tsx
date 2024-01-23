import { DpButton } from '@js-monorepo/button'
import { forwardRef } from 'react'
import { BiLogOutCircle } from 'react-icons/bi'
import { twMerge } from 'tailwind-merge'
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
        variant="accent"
        className={twMerge('flex gap-1 py-2 px-4 w-full text-white', className)}
        ref={ref}
      >
        <BiLogOutCircle className="text-red-600 text-2xl" />
        <span>Sign out</span>
      </DpButton>
    )
  }
)

DpLogoutButton.displayName = 'DpLogoutButton'

export default DpLogoutButton
