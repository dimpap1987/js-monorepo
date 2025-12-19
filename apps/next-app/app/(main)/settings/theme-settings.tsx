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
      background: 'oklch(1 0 0)',
      primary: 'oklch(0.205 0 0)',
      foreground: 'oklch(0.145 0 0)',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark theme for low-light environments',
    preview: {
      background: 'oklch(0.145 0 0)',
      primary: 'oklch(0.8 0.15 250)',
      foreground: 'oklch(0.985 0 0)',
    },
  },
  {
    id: 'blue',
    name: 'Blue',
    description: 'Blue color scheme',
    preview: {
      background: 'oklch(0.96 0.02 250)',
      primary: 'oklch(0.6 0.2 250)',
      foreground: 'oklch(0.15 0.02 250)',
    },
  },
  {
    id: 'green',
    name: 'Green',
    description: 'Green color scheme',
    preview: {
      background: 'oklch(0.96 0.02 150)',
      primary: 'oklch(0.5 0.2 150)',
      foreground: 'oklch(0.15 0.02 150)',
    },
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    description: 'Dark theme with blue accents',
    preview: {
      background: 'oklch(0.12 0.02 250)',
      primary: 'oklch(0.65 0.2 250)',
      foreground: 'oklch(0.95 0.01 250)',
    },
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Nostalgic retro color palette',
    preview: {
      background: 'oklch(0.95 0.02 50)',
      primary: 'oklch(0.5 0.15 280)',
      foreground: 'oklch(0.2 0.05 280)',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: 'Dark theme inspired by Dracula',
    preview: {
      background: 'oklch(0.18 0.02 280)',
      primary: 'oklch(0.75 0.15 350)',
      foreground: 'oklch(0.95 0.01 280)',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Arctic, north-bluish color palette',
    preview: {
      background: 'oklch(0.98 0.005 250)',
      primary: 'oklch(0.45 0.08 250)',
      foreground: 'oklch(0.25 0.01 250)',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    description: 'Popular code editor theme',
    preview: {
      background: 'oklch(0.22 0.01 0)',
      primary: 'oklch(0.75 0.15 150)',
      foreground: 'oklch(0.9 0.01 0)',
    },
  },
  {
    id: 'tokyonight',
    name: 'Tokyo Night',
    description: 'Clean dark theme with vibrant accents',
    preview: {
      background: 'oklch(0.15 0.02 250)',
      primary: 'oklch(0.7 0.18 280)',
      foreground: 'oklch(0.9 0.01 250)',
    },
  },
  {
    id: 'solarized',
    name: 'Solarized',
    description: 'Precision color scheme for terminals',
    preview: {
      background: 'oklch(0.95 0.02 90)',
      primary: 'oklch(0.45 0.15 220)',
      foreground: 'oklch(0.25 0.02 90)',
    },
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox',
    description: 'Retro groove color scheme',
    preview: {
      background: 'oklch(0.85 0.05 85)',
      primary: 'oklch(0.6 0.22 25)',
      foreground: 'oklch(0.2 0.05 85)',
    },
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin',
    description: 'Soothing pastel theme',
    preview: {
      background: 'oklch(0.95 0.01 280)',
      primary: 'oklch(0.65 0.2 15)',
      foreground: 'oklch(0.25 0.01 280)',
    },
  },
  {
    id: 'onedark',
    name: 'One Dark',
    description: 'Atom One Dark theme',
    preview: {
      background: 'oklch(0.22 0.01 240)',
      primary: 'oklch(0.6 0.2 20)',
      foreground: 'oklch(0.85 0.02 240)',
    },
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    description: 'Retro-futuristic neon theme',
    preview: {
      background: 'oklch(0.15 0.03 320)',
      primary: 'oklch(0.7 0.28 350)',
      foreground: 'oklch(0.95 0.02 320)',
    },
  },
  {
    id: 'red',
    name: 'Red',
    description: 'Red color scheme',
    preview: {
      background: 'oklch(0.98 0.01 20)',
      primary: 'oklch(0.55 0.25 20)',
      foreground: 'oklch(0.2 0.02 20)',
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
      <section className="space-y-6 text-foreground">
        <div className="mb-6">
          <h2 className="mb-2">Appearance</h2>
          <p className="text-sm text-foreground-muted">Customize how the app looks and feels</p>
        </div>
        <SettingsItem label="Theme">
          <div className="text-sm text-foreground-muted">Loading themes...</div>
        </SettingsItem>
      </section>
    )
  }

  return (
    <section className="space-y-6 text-foreground">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="mb-2">Appearance</h2>
        <p className="text-sm text-foreground-muted">Customize how the app looks and feels</p>
      </div>

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
