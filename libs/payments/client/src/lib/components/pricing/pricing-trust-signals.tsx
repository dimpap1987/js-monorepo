import { Shield, CreditCard, XCircle } from 'lucide-react'
import { cn } from '@js-monorepo/ui/util'

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
    text: '30-day Trial',
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    text: 'Secure payment with Stripe',
  },
  {
    icon: <XCircle className="w-5 h-5" />,
    text: 'Cancel anytime',
  },
]

export function PricingTrustSignals({ signals = defaultSignals, className }: PricingTrustSignalsProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10', className)}>
      {signals.map((signal, index) => (
        <div key={index} className="flex items-center gap-2 text-foreground-muted">
          <span className="text-status-success">{signal.icon}</span>
          <span className="text-sm font-medium">{signal.text}</span>
        </div>
      ))}
    </div>
  )
}
