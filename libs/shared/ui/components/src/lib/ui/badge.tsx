import { cn } from '@js-monorepo/ui/util'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:brightness-90',
        accent: 'bg-accent border-transparent text-accent-foreground hover:brightness-95 focus:brightness-95',
        secondary: 'border-transparent bg-background-secondary text-secondary-foreground hover:bg-secondary',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:brightness-90',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
