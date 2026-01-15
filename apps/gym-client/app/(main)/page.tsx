import { generateMetadata } from '@js-monorepo/seo'
import { AppConfig } from '../../lib/app-config'
import { Metadata } from 'next/types'
import { ContainerTemplate } from '@js-monorepo/templates'
import { getTranslations } from 'next-intl/server'
import { LocaleSwitcher } from '../../components/locale-switcher'
import { FeatureBadge } from '@js-monorepo/components/ui/feature-badge'
import { ComingSoonWrapper } from '@js-monorepo/components/ui/coming-soon-wrapper'
import { HomeBanner } from '../../components/home-banner'

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
        <HomeBanner />
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

        {/* Component Showcase */}
        <div className="mt-16 space-y-12">
          {/* FeatureBadge Showcase */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Feature Badges</h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <FeatureBadge variant="soon" />
              <FeatureBadge variant="hot" animated />
              <FeatureBadge variant="new" animated />
              <FeatureBadge variant="beta" />
              <FeatureBadge variant="premium" />
              <FeatureBadge variant="deprecated" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <FeatureBadge variant="new" size="sm" label="Small" />
              <FeatureBadge variant="new" size="default" label="Default" />
              <FeatureBadge variant="new" size="lg" label="Large" />
            </div>
          </section>

          {/* ComingSoonWrapper Showcase */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Coming Soon Wrapper</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <ComingSoonWrapper badgePosition="top-right">
                <div className="p-6 border border-border rounded-lg bg-background-secondary">
                  <h3 className="font-semibold mb-2">AI Coach</h3>
                  <p className="text-sm text-foreground-muted">
                    Get personalized workout recommendations powered by AI.
                  </p>
                </div>
              </ComingSoonWrapper>
            </div>
          </section>
        </div>
      </div>
      <LocaleSwitcher></LocaleSwitcher>
    </ContainerTemplate>
  )
}
