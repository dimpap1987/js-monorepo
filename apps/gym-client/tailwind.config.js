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
      // Add gym-client specific theme extensions here
    },
  },
  plugins: [],
}
