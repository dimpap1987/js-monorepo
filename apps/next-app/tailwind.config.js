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
        border: 'hsl(var(--border))',
        'background-primary': 'hsl(var(--background-primary))',
        'background-secondary': 'hsl(var(--background-secondary))',
        'background-secondary-lighter':
          'hsl(var(--background-secondary-lighter))',
        foreground: 'hsl(var(--foreground))',
        'foreground-hover': 'hsl(var(--foreground-hover))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          border: 'hsl(var(--primary-border))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          hover: 'hsl(var(--secondary-hover))',
          border: 'hsl(var(--secondary-border))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          hover: 'hsl(var(--accent-hover))',
          border: 'hsl(var(--accent-border))',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger))',
          foreground: 'hsl(var(--danger-foreground))',
          hover: 'hsl(var(--danger-hover))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          hover: 'hsl(var(--destructive-hover))',
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
