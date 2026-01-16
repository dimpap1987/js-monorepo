import { Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function OnboardingHeader() {
  const t = useTranslations('scheduling.onboarding')
  const tCommon = useTranslations('common')

  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">{t('welcome')}</span>
      </div>
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-foreground-muted">{t('subtitle')}</p>
    </div>
  )
}
