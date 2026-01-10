import { generateMetadata } from '@js-monorepo/seo'
import { AppConfig } from '../../lib/app-config'
import { Metadata } from 'next/types'
import { ContainerTemplate } from '@js-monorepo/templates'
import { getTranslations } from 'next-intl/server'
import { LocaleSwitcher } from '../../components/locale-switcher'

export const metadata: Metadata = generateMetadata({
  title: 'Home',
  description: `Welcome to ${AppConfig.appName} - A modern web application built with Next.js. Discover our features, pricing, and more.`,
})

export default async function HomePage() {
  const t = await getTranslations('home')
  const tCommon = await getTranslations('common')

  return (
    <ContainerTemplate>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="text-lg text-foreground-muted mb-8">{t('subtitle')}</p>
        <div className="flex gap-4">
          <a
            href="/workouts"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            {t('browseWorkouts')}
          </a>
          <a
            href="/about"
            className="px-6 py-3 border border-border rounded-lg hover:bg-background-secondary transition-colors"
          >
            {tCommon('learnMore')}
          </a>
        </div>
      </div>
      <LocaleSwitcher></LocaleSwitcher>
    </ContainerTemplate>
  )
}
