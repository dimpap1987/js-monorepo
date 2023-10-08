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
        'primary-color': 'rgb(17, 24, 39)',
        'primary-color-hover': 'rgb(37, 44, 59)',
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
