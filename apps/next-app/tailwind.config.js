const { createGlobPatternsForDependencies } = require('@nx/react/tailwind')
const { join } = require('path')
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: ['class'],
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          bg: 'hsl(var(--primary-bg))',
          foreground: 'hsl(var(--primary-foreground))',
          'foreground-hover': 'hsl(var(--primary-foreground-hover))',
          hover: 'hsl(var(--primary-hover))',
          border: 'hsl(var(--primary-border))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          bg: 'hsl(var(--secondary-bg))',
          'bg-lighter': 'hsl(var(--secondary-lighter-bg))',
          foreground: 'hsl(var(--secondary-foreground))',
          'foreground-hover': 'hsl(var(--secondary-foreground-hover))',
          hover: 'hsl(var(--secondary-hover))',
          border: 'hsl(var(--secondary-border))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          bg: 'hsl(var(--bg-accent))',
          foreground: 'hsl(var(--accent-foreground))',
          'foreground-hover': 'hsl(var(--accent-foreground-hover))',
          hover: 'hsl(var(--accent-hover))',
          border: 'hsl(var(--accent-border))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          bg: 'hsl(var(--bg-danger))',
          foreground: 'hsl(var(--danger-foreground))',
          'foreground-hover': 'hsl(var(--danger-hover))',
          hover: 'hsl(var(--danger-hover))',
          border: 'hsl(var(--danger-border))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          bg: 'hsl(var(--bg-destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          'foreground-hover': 'hsl(var(--destructive-hover))',
          hover: 'hsl(var(--destructive-hover))',
          border: 'hsl(var(--destructive-border))',
        },
      },
      minHeight: {
        '100svh': '100svh',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
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
      zIndex: {
        100: '100',
      },
      boxShadow: {
        primary:
          '0 0 40px -2px hsl(var(--primary), 0.1), 0 2px 4px -1px hsl(var(--primary), 0.06)',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['hover'],
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
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
