'use client'

import { BackArrowWithLabel } from '@js-monorepo/back-arrow'
import { getEnabledThemes } from '@js-monorepo/theme-provider'
import { cn } from '@js-monorepo/ui/util'
import { useTheme } from 'next-themes'
import { SettingsItem } from '../settings-items'

const themes = getEnabledThemes()

export function ThemeSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const currentTheme = theme === 'system' ? 'system' : resolvedTheme || theme || 'light'

  return (
    <section className="space-y-6 text-foreground">
      {/* Page Header */}
      <BackArrowWithLabel>
        <h2 className="mb-2">Appearance</h2>
        <p className="text-sm text-foreground-muted">Customize how the app looks and feels</p>
      </BackArrowWithLabel>

      <SettingsItem label="Theme">
        <p className="text-xs font-semibold sm:text-sm mt-1 mb-4 text-foreground-neutral">
          Choose how the app looks to you. You can select a theme or match your system settings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {themes.map((themeOption) => {
            const isSelected = currentTheme === themeOption.id || (themeOption.id === 'system' && theme === 'system')

            return (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id)}
                className={cn(
                  'relative flex flex-col items-start p-4 rounded-lg border-2 transition-all',
                  'hover:border-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                  isSelected ? 'border-primary bg-accent' : 'border-border bg-background hover:bg-background-secondary'
                )}
                aria-pressed={isSelected}
              >
                {/* Checkmark indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Theme Preview */}
                {themeOption.preview ? (
                  <div className="w-full mb-3 rounded-md overflow-hidden border border-border">
                    <div
                      className="h-12 flex items-center justify-between px-3"
                      style={{ backgroundColor: themeOption.preview.background }}
                    >
                      <div className="flex gap-1.5">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: themeOption.preview.primary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: themeOption.preview.foreground }}
                        />
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1 h-4 rounded" style={{ backgroundColor: themeOption.preview.primary }} />
                        <div className="w-1 h-4 rounded" style={{ backgroundColor: themeOption.preview.foreground }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full mb-3 rounded-md overflow-hidden border border-border h-12 flex items-center justify-center bg-background-secondary">
                    <svg
                      className="w-6 h-6 text-foreground-neutral"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Theme Name */}
                <div className="text-left w-full">
                  <div className="font-semibold text-sm mb-1 text-foreground">{themeOption.name}</div>
                  <div className="text-xs text-foreground-muted">{themeOption.description}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Current Theme Info */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="text-sm text-foreground">
            <span className="font-medium">Current theme:</span>{' '}
            <span className="text-primary">
              {themes.find((t) => t.id === (theme === 'system' ? 'system' : currentTheme))?.name || 'Light'}
            </span>
            {theme === 'system' && (
              <span className="text-foreground-muted ml-2">
                (resolved to {themes.find((t) => t.id === currentTheme)?.name || 'Light'})
              </span>
            )}
          </div>
        </div>
      </SettingsItem>
    </section>
  )
}
