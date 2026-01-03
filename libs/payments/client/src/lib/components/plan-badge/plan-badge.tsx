import { cn } from '@js-monorepo/ui/util'
import { Crown } from 'lucide-react'

interface PlanBadgeProps {
  plan: string | null | undefined
  size?: 'sm' | 'md' | 'xl'
  className?: string
}

const planConfig: Record<string, { label: string; className: string }> = {
  basic: {
    label: 'Basic',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  pro: {
    label: 'Pro',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
}

const sizeConfig = {
  sm: {
    container: 'px-2 py-0.5 text-xs',
    icon: 'h-3 w-3',
  },
  md: {
    container: 'px-2.5 py-1 text-sm',
    icon: 'h-3.5 w-3.5',
  },
  xl: {
    container: 'px-4 py-1.5 text-lg font-semibold',
    icon: 'h-5 w-5',
  },
}

export function PlanBadge({ plan, size = 'sm', className }: PlanBadgeProps) {
  if (!plan) return null

  const normalizedPlan = plan.toLowerCase()
  const config = planConfig[normalizedPlan] || {
    label: plan,
    className: 'bg-primary/10 text-primary border-primary/20',
  }

  const selectedSize = sizeConfig[size]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium capitalize',
        selectedSize.container,
        config.className,
        className
      )}
    >
      <Crown className={cn(selectedSize.icon)} />
      {config.label}
    </span>
  )
}
