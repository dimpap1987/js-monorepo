const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  theme: {
    extend: {
      container: {
        center: 'true',
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem',
        },
        screens: {
          sm: '100%',
          xl: '1620px',
          '3xl': '1920px',
          '4xl': '2560px',
        },
      },
      minHeight: {
        '100svh': '100svh',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      zIndex: {
        100: '100',
      },
      colors: {
        // Base colors - using var() directly to support OKLCH
        background: 'var(--background)',
        'background-50': 'var(--background-50)',
        'background-80': 'var(--background-80)',
        'background-secondary': 'var(--background-secondary)',
        'background-card': 'var(--background-card)',
        foreground: 'var(--foreground)',
        'foreground-secondary': 'var(--foreground-secondary)',
        'foreground-neutral': 'var(--foreground-neutral)',
        'foreground-muted': 'var(--foreground-muted)',
        border: 'var(--border)',
        'border-glass': 'var(--border-glass)',
        'button-border': 'var(--button-border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Primary colors
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        // Secondary colors
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        // Muted colors
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        // Accent colors
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        // Destructive colors
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          foreground: 'var(--danger-foreground)',
        },
        // Card & Popover
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        // Sidebar colors
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        // Chart colors
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
        // Brand colors
        brand: {
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
        },
        // Status colors
        status: {
          success: 'var(--status-success)',
          'success-bg': 'var(--status-success-bg)',
          warning: 'var(--status-warning)',
          'warning-bg': 'var(--status-warning-bg)',
          error: 'var(--status-error)',
          'error-bg': 'var(--status-error-bg)',
          info: 'var(--status-info)',
          'info-bg': 'var(--status-info-bg)',
          backlog: 'var(--status-backlog)',
          'in-progress': 'var(--status-in-progress)',
          waiting: 'var(--status-waiting)',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
