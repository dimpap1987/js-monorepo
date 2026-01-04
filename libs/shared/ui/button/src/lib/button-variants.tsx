export const buttonVariants = {
  base: 'relative inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] [&>*]:text-inherit',
  variants: {
    variant: {
      primary:
        'bg-primary text-primary-foreground shadow-sm hover:brightness-110 hover:shadow-md focus-visible:ring-primary active:brightness-95 [&>*]:text-primary-foreground',
      accent:
        'bg-accent text-accent-foreground shadow-sm hover:brightness-105 hover:shadow-md focus-visible:ring-accent active:brightness-95 [&>*]:text-accent-foreground',
      secondary:
        'bg-secondary text-secondary-foreground shadow-sm hover:brightness-110 hover:shadow-md focus-visible:ring-secondary active:brightness-95 [&>*]:text-secondary-foreground',
      danger:
        'bg-danger text-danger-foreground shadow-sm hover:brightness-110 hover:shadow-md focus-visible:ring-danger active:brightness-95 [&>*]:text-danger-foreground',
      outline:
        'border border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent focus-visible:ring-accent active:brightness-95',
      ghost:
        'text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-accent active:brightness-95',
    },
    size: {
      default: 'h-9 px-4 py-2',
      small: 'h-8 px-3 py-1.5 text-xs',
      large: 'h-11 px-8 py-2.5 text-base',
    },
  },
  disabled: 'cursor-not-allowed opacity-50',
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
} as const

export type VariantProps = {
  variant?: keyof typeof buttonVariants.variants.variant
  size?: keyof typeof buttonVariants.variants.size
}
