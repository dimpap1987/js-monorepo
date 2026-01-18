import { useTranslations } from 'next-intl'

export function OnboardingHeader() {
  const t = useTranslations('scheduling.onboarding')
  const tCommon = useTranslations('common')

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-foreground-muted">{t('subtitle')}</p>
    </div>
  )
}
