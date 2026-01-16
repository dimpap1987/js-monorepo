const { createGlobPatternsForDependencies } = require('@nx/react/tailwind')
const { join } = require('path')
const sharedConfig = require('../../libs/shared/styles/src/lib/tailwind.config')

module.exports = {
  presets: [sharedConfig],
  content: [
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      // Add bibikos-client specific theme extensions here
    },
  },
  plugins: [
    ({ addUtilities }) => {
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
