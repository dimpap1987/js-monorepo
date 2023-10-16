import { twMerge } from 'tailwind-merge'

/* eslint-disable-next-line */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  className?: string
  children?: React.ReactNode
  loading?: boolean
}

export function ButtonComponent({
  variant = 'primary',
  size = 'medium',
  className,
  children,
  loading = false,
  ...props
}: ButtonProps) {
  //disabled classes
  const disabledStyles = 'cursor-not-allowed opacity-50'
  // base styles
  const baseStyles = `px-12 py-2 rounded font-bold focus:outline-none flex items-center justify-center w-full whitespace-nowrap overflow-hidden ${
    loading ? disabledStyles : ''
  }`
  // Variant styles
  const variantStyles = {
    primary:
      'bg-turquoise border-turquoise text-dark-charcoal hover:bg-turquoise-hover',
    secondary:
      'bg-goldenrod border-goldenrod text-dark-charcoal hover:bg-goldenrod-hover',
    danger: 'bg-pink border-pink text-dark-charcoal hover:bg-pink-hover',
  }

  // Size styles
  const sizeStyles = {
    small: 'text-sm py-1',
    medium: 'text-base py-2',
    large: 'text-lg py-3',
  }

  // Merge styles using tailwind-merge
  const buttonClass = twMerge(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className // Merge additional classes passed as props
  )

  const buttonContent = children ?? 'Press button'
  const loadingContent = loading && (
    <div
      className="inline-block absolute left-4 h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent  motion-reduce:animate-[spin_1.5s_linear_infinite] mr-3"
      role="status"
    ></div>
  )

  return (
    <button className={buttonClass} {...props} disabled={loading}>
      {loadingContent}
      {buttonContent}
    </button>
  )
}

export default ButtonComponent
