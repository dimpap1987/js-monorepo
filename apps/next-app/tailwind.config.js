const { createGlobPatternsForDependencies } = require('@nx/react/tailwind')
const { join } = require('path')
const sharedConfig = require('../../libs/shared/styles/src/lib/tailwind.config')

module.exports = {
  presets: [sharedConfig],
  darkMode: ['class'],
  content: [
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        'background-secondary': 'hsl(var(--background-secondary))',
        'background-card': 'hsl(var(--background-card))',
        foreground: 'hsl(var(--foreground))',
        'foreground-neutral': 'hsl(var(--foreground-neutral))',
        border: 'hsl(var(--border))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          foreground: 'hsl(var(--danger-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      animation: {
        bubble: 'bubble ease-in-out infinite',
      },
      keyframes: {
        bubble: {
          '0%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-100%)',
          },
          '100%': {
            transform: 'translateY(0)',
          },
        },
      },
      boxShadow: {
        primary: '0 0 40px -2px hsl(var(--primary), 0.1), 0 2px 4px -1px hsl(var(--primary), 0.06)',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['hover'],
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.navbar-height': {
          height: 'var(--navbar-height)',
        },
        '.top-navbar-offset': {
          top: 'var(--navbar-height)',
        },
      })
    },
  ],
}
