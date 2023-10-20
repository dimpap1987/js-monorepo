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
        className,
        'flex gap-1 py-2 px-4 font-semibold transition-colors duration-200 ease-in-out hover:bg-blue-900 mx-auto w-full flex justify-center'
      )}
    >
      <BiLogInCircle className="text-green-400 text-2xl" />
      <span>Sign in</span>
    </button>
  )
}

export default LoginButtonComponent
