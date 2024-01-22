export const buttonVariants = {
  base: 'relative rounded font-bold flex items-center justify-center whitespace-nowrap',
  variants: {
    variant: {
      primary:
        'bg-primary border-primary-border text-primary-foreground hover:bg-primary-hover',
      secondary:
        'bg-secondary border-secondary-border text-secondary-foreground hover:bg-secondary-hover',
      danger:
        'bg-danger border-danger-border text-danger-foreground hover:bg-danger-hover',
    },
    size: {
      default: 'h-9 px-4 py-2', // Your default size styles
      small: 'h-8 rounded-md px-3 text-xs', // Your small size styles
      large: 'h-10 rounded-md px-8', // Your large size styles
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
