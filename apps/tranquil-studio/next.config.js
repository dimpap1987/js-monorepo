// @ts-check

const { composePlugins, withNx } = require('@nx/next')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 * */
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    const newConfig = {
      ...config,
      optimization: {
        ...config.optimization,
        usedExports: !dev, // Enable tree-shaking only in production
      },
    }
    return newConfig
  },
  swcMinify: true,
  images: {
    remotePatterns: [],
  },
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withBundleAnalyzer,
]

module.exports = composePlugins(...plugins)(nextConfig)
