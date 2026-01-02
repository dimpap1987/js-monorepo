import { Shield, CreditCard, XCircle } from 'lucide-react'
import { cn } from '@js-monorepo/ui/util'
import { TRIAL_DURATION_DAYS } from '../../constants'

interface TrustSignalItem {
  icon: React.ReactNode
  text: string
}

interface PricingTrustSignalsProps {
  signals?: TrustSignalItem[]
  className?: string
}

const defaultSignals: TrustSignalItem[] = [
  {
    icon: <Shield className="w-5 h-5" />,
    text: `${TRIAL_DURATION_DAYS}-day Trial`,
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    text: 'Secure',
  },
  {
    icon: <XCircle className="w-5 h-5" />,
    text: 'Cancel anytime',
  },
]

export function PricingTrustSignals({ signals = defaultSignals, className }: PricingTrustSignalsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-3 sm:gap-10', className)}>
      {signals.map((signal, index) => (
        <div key={index} className="flex items-center gap-2 text-foreground-muted">
          <span className="text-status-success">{signal.icon}</span>
          <span className="text-sm font-medium">{signal.text}</span>
        </div>
      ))}
    </div>
  )
}
