import { cn } from '@js-monorepo/ui/util'
import { Crown } from 'lucide-react'

interface PlanBadgeProps {
  plan: string | null | undefined
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

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  if (!plan) return null

  const config = planConfig[plan.toLowerCase()] || {
    label: plan,
    className: 'bg-primary/10 text-primary border-primary/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium capitalize',
        config.className,
        className
      )}
    >
      <Crown className="h-3 w-3" />
      {config.label}
    </span>
  )
}
