// @ts-check

const { composePlugins, withNx } = require('@nx/next')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const isDev = process.env.NODE_ENV === 'development'

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 */
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  async headers() {
    return [
      {
        // Static assets with content hash - cache for 1 year
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Images - cache for 1 week
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Fonts - cache for 1 year
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Favicon and static assets in public folder
        source: '/:path(.+\\.(?:ico|svg|png|jpg|jpeg|gif|webp))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },
  async rewrites() {
    if (!isDev) return []

    return [
      {
        source: '/api/:path*',
        destination: `${process.env.DEV_BACKEND_URL}/api/:path*`,
      },
    ]
  },
  webpack: (config, { dev }) => {
    return {
      ...config,
      optimization: {
        ...config.optimization,
        usedExports: !dev, // Enable tree-shaking only in production
      },
    }
  },
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
      },
    ],
  },
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withBundleAnalyzer,
]

module.exports = composePlugins(...plugins)(nextConfig)
