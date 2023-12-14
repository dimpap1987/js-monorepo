import { BiLogOutCircle } from 'react-icons/bi'
import { twMerge } from 'tailwind-merge'
export interface LogoutButtonComponentProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly className: string
}

function LogoutButtonComponent({
  className,
  ...props
}: LogoutButtonComponentProps) {
  return (
    <button
      {...props}
      title="Sign out"
      className={twMerge(
        'flex gap-1 py-2 px-4 font-semibold transition-colors duration-200 ease-in-out hover:bg-accent-hover mx-auto w-full flex justify-center',
        className
      )}
    >
      <BiLogOutCircle className="text-red-600 text-2xl" />
      <span>Sign out</span>
    </button>
  )
}

export default LogoutButtonComponent
