'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { SettingsItem } from './settings-items'
import { cn } from '@js-monorepo/ui/util'

const themes = [
  {
    id: 'light',
    name: 'Light',
    description: 'Light theme with bright colors',
    preview: {
      background: 'hsl(43.64, 47.83%, 95.49%)',
      primary: 'hsl(265, 76%, 54%)',
      foreground: 'hsl(78, 0%, 28%)',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark theme for low-light environments',
    preview: {
      background: 'hsl(221, 39%, 11%)',
      primary: 'hsl(265, 76%, 54%)',
      foreground: 'hsl(0, 0%, 98%)',
    },
  },
  {
    id: 'blue',
    name: 'Blue',
    description: 'Blue color scheme',
    preview: {
      background: 'hsl(220, 30%, 96%)',
      primary: 'hsl(217, 91%, 60%)',
      foreground: 'hsl(220, 20%, 15%)',
    },
  },
  {
    id: 'green',
    name: 'Green',
    description: 'Green color scheme',
    preview: {
      background: 'hsl(142, 30%, 96%)',
      primary: 'hsl(142, 76%, 36%)',
      foreground: 'hsl(142, 20%, 15%)',
    },
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    description: 'Dark theme with blue accents',
    preview: {
      background: 'hsl(220, 40%, 8%)',
      primary: 'hsl(217, 91%, 60%)',
      foreground: 'hsl(220, 10%, 95%)',
    },
  },
  {
    id: 'system',
    name: 'System',
    description: 'Follow your system preference',
    preview: null,
  },
]

export function ThemeSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? (theme === 'system' ? 'system' : resolvedTheme || theme || 'light') : 'light'

  if (!mounted) {
    return (
      <section className="p-2 space-y-6 text-white">
        <SettingsItem label="Appearance">
          <div className="text-sm text-gray-400">Loading themes...</div>
        </SettingsItem>
      </section>
    )
  }

  return (
    <section className="p-2 space-y-6 text-white">
      <SettingsItem label="Appearance">
        <p className="text-xs font-semibold sm:text-sm mt-1 mb-4 text-gray-300">
          Choose how the app looks to you. You can select a theme or match your system settings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((themeOption) => {
            const isSelected = currentTheme === themeOption.id || (themeOption.id === 'system' && theme === 'system')

            return (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id)}
                className={cn(
                  'relative flex flex-col items-start p-4 rounded-lg border-2 transition-all',
                  'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:bg-background-secondary'
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
                  <div className="w-full mb-3 rounded-md overflow-hidden border border-border/50">
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
                  <div className="w-full mb-3 rounded-md overflow-hidden border border-border/50 h-12 flex items-center justify-center bg-background-secondary">
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
                  <div className="font-semibold text-sm mb-1">{themeOption.name}</div>
                  <div className="text-xs text-gray-400">{themeOption.description}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Current Theme Info */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="text-sm text-gray-300">
            <span className="font-medium">Current theme:</span>{' '}
            <span className="text-primary">
              {themes.find((t) => t.id === (theme === 'system' ? 'system' : currentTheme))?.name || 'Light'}
            </span>
            {theme === 'system' && (
              <span className="text-gray-400 ml-2">
                (resolved to {themes.find((t) => t.id === currentTheme)?.name || 'Light'})
              </span>
            )}
          </div>
        </div>
      </SettingsItem>
    </section>
  )
}
