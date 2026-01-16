import { Check } from 'lucide-react'
import { cn } from '@js-monorepo/ui/util'

export interface Step {
  id: number
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

interface OnboardingProgressProps {
  steps: Step[]
  currentStep: number
}

export function OnboardingProgress({ steps, currentStep }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
              currentStep > step.id
                ? 'bg-primary border-primary text-primary-foreground'
                : currentStep === step.id
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-border text-foreground-muted'
            )}
          >
            {currentStep > step.id ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
          </div>
          {index < steps.length - 1 && (
            <div className={cn('w-16 sm:w-24 h-0.5 mx-2', currentStep > step.id ? 'bg-primary' : 'bg-border')} />
          )}
        </div>
      ))}
    </div>
  )
}
