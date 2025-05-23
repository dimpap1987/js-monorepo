export const buttonVariants = {
  base: 'relative text-base rounded-lg font-semibold flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-500 ease-in-out',
  variants: {
    variant: {
      primary:
        'bg-primary border-2 border-primary/80 text-primary-foreground hover:bg-primary/85 focus:bg-primary/85 [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      accent:
        'bg-accent border-2 border-accent/80 text-accent-foreground hover:bg-accent/85 focus:bg-accent/85 [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      secondary:
        'bg-secondary border-2 border-secondary/80 text-secondary-foreground hover:bg-secondary/85 focus:bg-secondary/85 [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      danger:
        'bg-danger border-2 border-danger/80 text-danger-foreground hover:bg-danger/85 focus:bg-danger/85 [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      outline: 'border-2 border-primary/80 bg-background text-foreground tracking-[0.04em]',
    },
    size: {
      default: 'h-8 px-4 py-4',
      small: 'h-7 px-2 text-xs py-3',
      large: 'h-10 px-8 py-5',
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
