// @ts-check

import { composePlugins, withNx } from '@nx/next'
import bundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const isDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'local_build'

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 */
const nextConfig = {
  nx: {
    svgr: false,
  },
  async headers() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || ''
    const devBackendUrl = process.env.DEV_BACKEND_URL || ''

    // Build connect-src with development allowances
    const connectSrcParts = ["'self'"]
    if (appUrl) connectSrcParts.push(appUrl)
    connectSrcParts.push('https://api.stripe.com')
    if (isDev) {
      connectSrcParts.push('http://localhost:*', 'http://127.0.0.1:*', 'ws://localhost:*', 'ws://127.0.0.1:*')
      if (devBackendUrl) connectSrcParts.push(devBackendUrl)
    }

    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com${isDev ? ' http://localhost:* http://127.0.0.1:*' : ''}`,
      `connect-src ${connectSrcParts.join(' ')}`,
      `frame-src 'self' https://js.stripe.com https://hooks.stripe.com`,
      `img-src 'self' data: blob: https://*.stripe.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com`,
      `style-src 'self' 'unsafe-inline'`,
      `font-src 'self' data:`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path(.+\\.(?:ico|svg|png|jpg|jpeg|gif|webp))',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
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
  webpack: (config, { dev }) => ({
    ...config,
    optimization: {
      ...config.optimization,
      usedExports: !dev,
    },
  }),
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', port: '' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', port: '' },
    ],
  },
}

const plugins = [withNx, withBundleAnalyzer, withNextIntl]

// ✅ ESM export instead of CommonJS
export default composePlugins(...plugins)(nextConfig)
