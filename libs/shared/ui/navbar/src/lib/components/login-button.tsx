import { BiLogInCircle } from 'react-icons/bi'
import { twMerge } from 'tailwind-merge'

interface LoginButtonComponentProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

function LoginButtonComponent({
  className,
  ...props
}: LoginButtonComponentProps) {
  return (
    <button
      {...props}
      title="Sign in"
      className={twMerge(
        'rounded-full shadow duration-300 flex gap-1 py-2 px-4 font-semibold transition-colors ease-in-out bg-accent-hover border border-accent-border hover:bg-background w-full flex justify-center',
        className
      )}
    >
      <BiLogInCircle className="text-green-400 text-2xl" />
      <span>Sign in</span>
    </button>
  )
}

export default LoginButtonComponent
