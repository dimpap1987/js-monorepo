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
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
