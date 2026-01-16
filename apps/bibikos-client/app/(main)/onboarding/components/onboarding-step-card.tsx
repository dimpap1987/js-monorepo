import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { useTranslations } from 'next-intl'
import { Step } from './onboarding-progress'

interface OnboardingStepCardProps {
  step: Step | undefined
  children: React.ReactNode
}

export function OnboardingStepCard({ step, children }: OnboardingStepCardProps) {
  const t = useTranslations('scheduling.onboarding')

  if (!step) return null

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <step.icon className="w-5 h-5 text-primary" />
          {t(step.title)}
        </CardTitle>
        <CardDescription>{t(step.subtitle)}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
