'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { cn } from '@js-monorepo/ui/util'
import { useTranslations } from 'next-intl'
import {
  Calendar,
  Users,
  ClipboardCheck,
  CalendarDays,
  Bell,
  Globe,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

const features = [
  { key: 'scheduling', icon: CalendarDays },
  { key: 'bookings', icon: Users },
  { key: 'attendance', icon: ClipboardCheck },
  { key: 'calendar', icon: Calendar },
  { key: 'notifications', icon: Bell },
  { key: 'profile', icon: Globe },
] as const

const steps = [
  { key: 'step1', number: '01' },
  { key: 'step2', number: '02' },
  { key: 'step3', number: '03' },
] as const

export function LandingPage() {
  const t = useTranslations('home')
  const { isLoggedIn, session } = useSession()
  const hasOrganizerProfile = session?.appUser?.hasOrganizerProfile === true

  const getCtaHref = () => {
    if (!isLoggedIn) return '/auth/login'
    return hasOrganizerProfile ? '/dashboard' : '/onboarding'
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-30" />

        <div className="container relative mx-auto px-4 py-10 sm:py-22">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">For Individual Instructors</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">{t('hero.title')}</h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-foreground-muted max-w-2xl mx-auto mb-10">{t('hero.subtitle')}</p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <DpNextNavLink href={getCtaHref()}>
                <Button size="lg" className="text-lg px-8 py-6 gap-2">
                  {t('hero.cta')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </DpNextNavLink>
              <DpNextNavLink href="/bookings">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  {t('hero.ctaSecondary')}
                </Button>
              </DpNextNavLink>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-8 mt-12 text-foreground-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm">Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm">No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 sm:py-22 bg-background-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">{t('features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map(({ key, icon: Icon }) => (
              <Card
                key={key}
                className={cn(
                  'group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300',
                  'hover:shadow-lg hover:shadow-primary/5'
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{t(`features.${key}.title`)}</h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">
                        {t(`features.${key}.description`)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 sm:py-22">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('howItWorks.title')}</h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">{t('howItWorks.subtitle')}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map(({ key, number }, index) => (
                <div key={key} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
                  )}

                  <div className="text-center">
                    {/* Step number */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-6">
                      {number}
                    </div>

                    <h3 className="font-semibold text-xl mb-3">{t(`howItWorks.${key}.title`)}</h3>
                    <p className="text-foreground-muted leading-relaxed">{t(`howItWorks.${key}.description`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-22">
        <div className="container mx-auto px-4">
          <div className="relative max-w-4xl mx-auto">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-3xl" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 rounded-3xl" />

            <div className="relative px-8 py-16 sm:px-16 sm:py-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">{t('cta.title')}</h2>
              <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">{t('cta.subtitle')}</p>
              <DpNextNavLink href={getCtaHref()}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 gap-2 bg-white text-primary hover:bg-white/90"
                >
                  {t('cta.button')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </DpNextNavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Footer spacing */}
      <div className="h-16" />
    </div>
  )
}
