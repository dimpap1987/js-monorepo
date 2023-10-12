const { createGlobPatternsForDependencies } = require('@nx/react/tailwind')
const { join } = require('path')

module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      backgroundColor: {
        'primary-dark': 'rgb(17, 24, 39)',
        'primary-light': 'rgb(36, 48, 71)',
        primary: 'rgb(26, 35, 53)',
        'primary-hover': 'rgb(37, 44, 59)',
        pink: 'rgb(255, 182, 193)',
        'pink-hover': 'rgb(245, 172, 183)',
        turquoise: 'rgb(64, 224, 208)',
        'turquoise-hover': 'rgb(44, 204, 188)',
        goldenrod: 'rgb(255, 223, 85)',
        'goldenrod-hover': 'rgb(235, 203, 65)',
      },
      borderColor: {
        pink: 'rgb(150, 125, 210)',
        turquoise: 'rgb(25, 160, 150)',
        goldenrod: 'rgb(220, 180, 40)',
      },
      textColor: {
        primary: 'rgb(26, 35, 53)',
        'dark-charcoal': ' rgb(19 45 62)',
      },
      minHeight: {
        '100svh': '100svh',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['hover'],
    },
  },
  plugins: [],
}
