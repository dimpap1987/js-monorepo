import { BiLogOutCircle } from 'react-icons/bi'

function LogoutButtonComponent(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...props}
      title="Sign out"
      className="flex gap-1 py-2 px-4 font-semibold transition-colors duration-200 ease-in-out hover:bg-accent-hover mx-auto w-full flex justify-center"
    >
      <BiLogOutCircle className="text-red-600 text-2xl" />
      <span>Sign out</span>
    </button>
  )
}

export default LogoutButtonComponent
