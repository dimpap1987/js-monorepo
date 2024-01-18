import { twMerge } from 'tailwind-merge'

interface DpButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: 'primary' | 'secondary' | 'danger'
  readonly size?: 'small' | 'medium' | 'large'
  readonly className?: string
  readonly children?: React.ReactNode
  readonly loading?: boolean
}

export function DpButton({
  variant = 'primary',
  size = 'medium',
  className,
  children,
  loading = false,
  ...props
}: DpButtonProps) {
  //disabled classes
  const disabledStyles = 'cursor-not-allowed opacity-50'
  // base styles
  const baseStyles = `relative px-12 py-2 rounded font-bold flex items-center justify-center w-full whitespace-nowrap ${
    loading ? disabledStyles : ''
  }`
  // Variant styles
  const variantStyles = {
    primary:
      'bg-primary border-primary-border text-primary-foreground hover:bg-primary-hover',
    secondary:
      'bg-secondary border-secondary-border text-secondary-foreground hover:bg-secondary-hover',
    danger:
      'bg-danger border-danger-border text-danger-foreground hover:bg-danger-hover',
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
    <output className="absolute left-3  h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent  motion-reduce:animate-[spin_1.5s_linear_infinite] mr-3"></output>
  )

  return (
    <button className={buttonClass} {...props} disabled={loading} tabIndex={0}>
      {loadingContent}
      {buttonContent}
    </button>
  )
}

export default DpButton
