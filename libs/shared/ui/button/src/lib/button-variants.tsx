export const buttonVariants = {
  base: 'relative rounded font-semibold flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-500 ease-in-out',
  variants: {
    variant: {
      primary:
        'bg-primary border border-primary-border text-primary-foreground hover:bg-primary-hover focus:bg-primary-hover [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      accent:
        'bg-accent border border-accent-border text-accent-foreground hover:bg-accent-hover focus:bg-accent-hover [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      secondary:
        'bg-secondary border border-secondary-border text-secondary-foreground hover:bg-secondary-hover focus:bg-secondary-hover [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      danger:
        'bg-danger border border-danger-border text-danger-foreground hover:bg-danger-hover focus:bg-danger-hover [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      outline:
        'border border-input bg-primary-bg hover:bg-accent text-foreground hover:text-primary-foreground',
    },
    size: {
      default: 'h-8 px-4 py-2',
      small: 'h-7 rounded-md px-2 text-xs',
      large: 'h-10 rounded-md px-8',
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
