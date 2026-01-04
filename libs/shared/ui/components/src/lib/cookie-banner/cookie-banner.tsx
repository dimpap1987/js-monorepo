'use client'

import { DpNextNavLink } from '@js-monorepo/nav-link'
import { cn } from '@js-monorepo/ui/util'
import { memo, useEffect, useMemo, useState } from 'react'
import { COOKIE_CATEGORY_IDS, COOKIE_CONSENT_KEY, COOKIE_CONSENT_VALUE, COOKIE_PREFERENCES_KEY } from './cookie-utils'

export interface CookieCategory {
  id: string
  name: string
  description: string
  essential?: boolean
  defaultEnabled?: boolean
}

export interface CookieBannerProps {
  privacyUrl?: string
  storageKey?: string
  optionalCategories?: CookieCategory[]
  acceptText?: string
  saveText?: string
  learnMoreText?: string
  className?: string
  onAccept?: (preferences: Record<string, boolean>) => void
}

const ESSENTIAL_COOKIE: CookieCategory = {
  id: COOKIE_CATEGORY_IDS.ESSENTIAL,
  name: 'Essential Cookies',
  description:
    'Required for authentication and maintaining your login session. These cookies cannot be disabled as they are necessary for the service to function.',
  essential: true,
}

function CookieBannerComponent({
  privacyUrl = '/privacy-cookie-statement',
  storageKey = COOKIE_CONSENT_KEY,
  optionalCategories = [],
  acceptText = 'Accept All',
  saveText = 'Save Preferences',
  learnMoreText = 'Learn More',
  className,
  onAccept,
}: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [preferences, setPreferences] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    if (stored) {
      try {
        setPreferences(JSON.parse(stored))
      } catch {
        setPreferences({ [COOKIE_CATEGORY_IDS.ESSENTIAL]: true })
      }
    } else {
      const defaults: Record<string, boolean> = {
        [COOKIE_CATEGORY_IDS.ESSENTIAL]: true,
      }
      optionalCategories.forEach((category) => {
        defaults[category.id] = category.defaultEnabled ?? true
      })
      setPreferences(defaults)
    }
  }, [optionalCategories])

  useEffect(() => {
    const consent = localStorage.getItem(storageKey)
    if (consent !== COOKIE_CONSENT_VALUE) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [storageKey])

  const handleToggle = (categoryId: string, enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [categoryId]: enabled,
    }))
  }

  const handleAccept = () => {
    const finalPreferences = {
      ...preferences,
      [COOKIE_CATEGORY_IDS.ESSENTIAL]: true,
    }
    localStorage.setItem(storageKey, COOKIE_CONSENT_VALUE)
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(finalPreferences))
    setIsClosing(true)
    setTimeout(() => {
      setIsVisible(false)
      onAccept?.(finalPreferences)
    }, 300)
  }

  const allCategories = useMemo(() => [ESSENTIAL_COOKIE, ...optionalCategories], [optionalCategories])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-card border-t-2 border-border',
        'shadow-2xl shadow-black/40',
        'transition-all duration-300 ease-in-out',
        isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100',
        className
      )}
      role="banner"
      aria-label="Cookie consent banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-foreground leading-relaxed">
                We use cookies to provide essential functionality and improve your experience. You can customize your
                preferences below.
              </p>
            </div>
            <div className="flex justify-between items-center gap-3 shrink-0 flex-wrap w-full sm:w-auto">
              <DpNextNavLink
                href={privacyUrl}
                className="text-sm underline font-medium text-primary hover:brightness-90 transition-colors"
              >
                {learnMoreText}
              </DpNextNavLink>
              {optionalCategories.length > 0 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium',
                    'border border-border bg-accent hover:brightness-95',
                    'text-foreground hover:text-foreground',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    'active:scale-95'
                  )}
                >
                  {isExpanded ? 'Show Less' : 'Customize'}
                </button>
              )}
              {!isExpanded && (
                <button
                  onClick={handleAccept}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-sm',
                    'bg-primary text-primary-foreground',
                    'hover:brightness-90 active:scale-95',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                  )}
                  aria-label="Accept all cookies"
                >
                  {acceptText}
                </button>
              )}
            </div>
          </div>

          {/* Expanded view with toggles */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t border-border">
              {allCategories.map((category) => {
                const isEssential = category.essential ?? false
                const isEnabled = preferences[category.id] ?? (isEssential ? true : category.defaultEnabled ?? false)

                return (
                  <div key={category.id} className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                        {isEssential && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-primary font-medium">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isEnabled}
                        aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${category.name}`}
                        disabled={isEssential}
                        onClick={() => !isEssential && handleToggle(category.id, !isEnabled)}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                          isEnabled ? 'bg-primary' : 'bg-muted',
                          isEssential && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <span
                          className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-background transition-transform',
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                )
              })}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleAccept}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-sm',
                    'bg-primary text-primary-foreground',
                    'hover:brightness-90 active:scale-95',
                    'transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                  )}
                  aria-label="Save cookie preferences"
                >
                  {saveText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const CookieBanner = memo(CookieBannerComponent)
