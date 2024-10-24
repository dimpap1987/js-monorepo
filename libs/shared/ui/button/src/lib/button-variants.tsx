export const buttonVariants = {
  base: 'relative rounded font-semibold flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-500 ease-in-out',
  variants: {
    variant: {
      primary:
        'bg-primary border-2 border-primary/80 text-primary-foreground hover:bg-primary/60 focus:bg-primary/60 [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      accent:
        'bg-accent border-2 border-accent/80 text-accent-foreground hover:bg-accent/60 focus:bg-accent/60 [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      secondary:
        'bg-secondary border-2 border-secondary/80 text-secondary-foreground hover:bg-secondary/60 focus:bg-secondary/60 [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      danger:
        'bg-danger border-2 border-danger/80 text-danger-foreground hover:bg-danger/60 focus:bg-danger/60 [text-shadow:1px_0px_1px_hsl(var(--tw-shadow-color))]',
      outline:
        'border-2 border-primary/80 bg-background hover:bg-accent text-foreground hover:text-primary-foreground',
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
