export interface ThemeConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  preview: {
    background: string
    primary: string
    foreground: string
  } | null
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'system',
    name: 'System',
    description: 'Follow your system preference',
    enabled: true,
    preview: null,
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Light theme with bright colors',
    enabled: true,
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
    enabled: true,
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
    enabled: false,
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
    enabled: false,
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
    enabled: false,
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
    enabled: false,
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
    enabled: true,
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
    enabled: true,
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
    enabled: false,
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
    enabled: true,
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
    enabled: false,
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
    enabled: false,
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
    enabled: false,
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
    enabled: false,
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
    enabled: false,
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
    enabled: false,
    preview: {
      background: 'oklch(0.98 0.01 20)',
      primary: 'oklch(0.55 0.25 20)',
      foreground: 'oklch(0.2 0.02 20)',
    },
  },
]

export function getEnabledThemes(): ThemeConfig[] {
  return THEMES.filter((theme) => theme.enabled)
}

export function getEnabledThemeIds(): string[] {
  return THEMES.filter((theme) => theme.enabled && theme.id !== 'system').map((theme) => theme.id)
}

export function getThemeById(id: string): ThemeConfig | undefined {
  return THEMES.find((theme) => theme.id === id)
}
