import * as React from 'react'
import { buttonVariants, type VariantProps } from './button-variants'
import { cn } from '@js-monorepo/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps {
  loading?: boolean
}

const DpButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      loading,
      children,
      ...props
    },
    ref
  ) => {
    const loadingContent = loading && (
      <output className="absolute left-3 h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] mr-3"></output>
    )
    return (
      <button
        className={cn(
          buttonVariants.base,
          buttonVariants.variants.variant[variant],
          buttonVariants.variants.size[size],
          className
        )}
        ref={ref}
        {...props}
        disabled={loading}
        tabIndex={0}
      >
        {loadingContent}
        {children}
      </button>
    )
  }
)
DpButton.displayName = 'DpButton'

export { DpButton, buttonVariants }
