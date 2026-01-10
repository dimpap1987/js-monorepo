# @js-monorepo/localization

A reusable, type-safe localization library for domain-based locale routing in Next.js applications.

## Features

- **Domain-based locale detection** - Map domains to locales (e.g., `example.com` → `en`, `example.gr` → `el`)
- **Development-friendly** - Query param override and cookie persistence for local testing
- **Next.js integration** - Ready-to-use middleware helpers for Next.js

## Installation

The library is available via the monorepo path alias:

```typescript
import { createLocalizationConfig } from '@js-monorepo/localization'
```

## Quick Start

### 1. Create your application config

```typescript
// i18n/config.ts
import { createLocalizationConfig, createLocaleValidator } from '@js-monorepo/localization'

const locales = ['en', 'el'] as const
type Locale = (typeof locales)[number]

export const localizationConfig = createLocalizationConfig({
  locales,
  defaultLocale: 'en',
  domainMap: {
    'example.com': 'en',
    'example.gr': 'el',
    localhost: 'en',
  },
  isDev: process.env.NODE_ENV === 'development',
})

export const isValidLocale = createLocaleValidator(locales)
```

### 2. Set up middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { shouldProcessPath, createNextLocaleMiddleware } from '@js-monorepo/localization'
import { localizationConfig } from './i18n/config'

const handleLocale = createNextLocaleMiddleware(localizationConfig)

export function middleware(request: NextRequest) {
  if (!shouldProcessPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }
  return handleLocale(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
```

### 3. Read locale in server components

```typescript
// i18n/request.ts (for next-intl)
import { getRequestConfig } from 'next-intl/server'
import { headers } from 'next/headers'
import { isValidLocale, localizationConfig } from './config'

export default getRequestConfig(async () => {
  const headersList = await headers()
  const headerLocale = headersList.get(localizationConfig.headerName)
  const locale = isValidLocale(headerLocale) ? headerLocale : localizationConfig.defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
```

## API Reference

### Core Configuration

#### `createLocalizationConfig(options)`

Creates a fully typed localization configuration.

```typescript
interface LocalizationConfigOptions<TLocale extends string> {
  locales: readonly TLocale[]
  defaultLocale: TLocale
  domainMap: Record<string, TLocale>
  isDev?: boolean
  cookieName?: string // default: 'NEXT_LOCALE'
  headerName?: string // default: 'x-locale'
}
```

### Validation

#### `createLocaleValidator(locales)`

Creates a type guard function for validating locales.

```typescript
const isValidLocale = createLocaleValidator(['en', 'el'] as const)
isValidLocale('en') // true
isValidLocale('fr') // false
```

### Domain Utilities

#### `getLocaleFromDomain(host, config)`

Gets locale from a domain/host string.

```typescript
getLocaleFromDomain('example.gr:3000', config) // 'el'
```

#### `getDomainForLocale(locale, domainMap)`

Gets the domain for a specific locale.

```typescript
getDomainForLocale('el', domainMap) // 'example.gr'
```

#### `createDomainResolver(domainMap)`

Creates a resolver function for mapping locales to domains.

```typescript
const resolveDomain = createDomainResolver(domainMap)
resolveDomain('el') // 'example.gr'
```

### URL Utilities

#### `createLocaleUrlGenerator(config, options)`

Creates a URL generator for locale switching.

```typescript
const getLocaleUrl = createLocaleUrlGenerator(config, { useQueryParam: isDev })
getLocaleUrl('el', '/dashboard')
// dev: '/dashboard?locale=el'
// prod: 'https://example.gr/dashboard'
```

#### `createAlternateUrlsGenerator(config, options)`

Creates a generator for all locale URLs (useful for SEO hreflang tags).

```typescript
const getAlternates = createAlternateUrlsGenerator(config)
getAlternates('/about')
// { en: 'https://example.com/about', el: 'https://example.gr/about' }
```

### Middleware Helpers

#### `shouldProcessPath(pathname)`

Checks if a path should be processed by locale middleware.

```typescript
shouldProcessPath('/_next/static/chunk.js') // false
shouldProcessPath('/dashboard') // true
```

#### `createPathMatcher(options)`

Creates a customizable path matcher.

```typescript
const shouldProcess = createPathMatcher({
  additionalSkipPatterns: [/^\/health/],
})
```

### Next.js Integration

#### `createNextLocaleMiddleware(config, options)`

Creates a Next.js middleware handler for locale detection.

```typescript
const handleLocale = createNextLocaleMiddleware(config, {
  cookieMaxAge: 60 * 60 * 24 * 365, // 1 year
  cookieSameSite: 'lax',
})
```

#### `detectLocaleFromNextRequest(request, config)`

Extracts locale detection result without creating a response.

```typescript
const result = detectLocaleFromNextRequest(request, config)
// { locale: 'el', shouldPersist: false, source: 'domain' }
```

## Locale Detection Priority

1. **Query param** (dev only) - `?locale=el` for testing
2. **Cookie** (dev only) - Persisted preference from query param
3. **Domain** - Production domain-based detection
4. **Default** - Fallback locale

## Architecture

The library follows SOLID principles:

- **Single Responsibility** - Each module handles one concern
- **Open/Closed** - Extend through configuration, not modification
- **Interface Segregation** - Small, focused interfaces
- **Dependency Inversion** - Depend on abstractions (config interfaces)

```
libs/shared/localization/
├── src/
│   ├── lib/
│   │   ├── core/           # Framework-agnostic utilities
│   │   │   ├── types.ts    # Type definitions
│   │   │   ├── config.ts   # Configuration factory
│   │   │   ├── validation.ts
│   │   │   ├── domain.ts   # Domain-locale mapping
│   │   │   └── url.ts      # URL generation
│   │   ├── middleware/     # Middleware helpers
│   │   │   ├── locale-detector.ts
│   │   │   └── path-matcher.ts
│   │   └── next/           # Next.js specific
│   │       └── middleware-helpers.ts
│   └── index.ts
└── README.md
```

## Environment Variables

Applications using this library should define:

```env
# Production domains
NEXT_PUBLIC_EN_DOMAIN=example.com
NEXT_PUBLIC_EL_DOMAIN=example.gr
```

## Use Cases & Examples

### 1. SEO: Adding hreflang Tags

Use `getAlternateLocaleUrls` to generate alternate URLs for SEO hreflang meta tags:

```tsx
// app/layout.tsx or any page
import { getAlternateLocaleUrls } from '@/lib/locale/locale-utils'

export async function generateMetadata({ params }): Promise<Metadata> {
  const pathname = '/about' // or get from params
  const alternates = getAlternateLocaleUrls(pathname)

  return {
    alternates: {
      languages: {
        en: alternates.en,
        el: alternates.el,
      },
    },
  }
}
```

**Output in HTML:**

```html
<link rel="alternate" hreflang="en" href="https://example.com/about" />
<link rel="alternate" hreflang="el" href="https://example.gr/about" />
```

### 2. Locale Switcher with Full URL

Use `getLocaleUrl` for locale switching links:

```tsx
// components/locale-switcher.tsx
import { getLocaleUrl } from '@/lib/locale/locale-utils'
import { usePathname } from 'next/navigation'

export function LocaleSwitcher() {
  const pathname = usePathname()

  return (
    <nav>
      <a href={getLocaleUrl('en', pathname)}>English</a>
      <a href={getLocaleUrl('el', pathname)}>Greek</a>
    </nav>
  )
}
```

### 3. Server-Side Locale Detection (API Routes)

Use `getLocaleFromDomain` to detect locale in API routes or server actions:

```ts
// app/api/content/route.ts
import { getLocaleFromDomain } from '@js-monorepo/localization'
import { localizationConfig } from '@/i18n/config'

export async function GET(request: Request) {
  const host = request.headers.get('host') ?? 'localhost'
  const locale = getLocaleFromDomain(host, localizationConfig)

  // Fetch locale-specific content
  const content = await fetchContent(locale)
  return Response.json(content)
}
```

### 4. Custom Middleware with Authentication

Use `detectLocaleFromNextRequest` and `applyLocaleToResponse` for composing locale with auth:

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { shouldProcessPath, detectLocaleFromNextRequest, applyLocaleToResponse } from '@js-monorepo/localization'
import { localizationConfig } from './i18n/config'

export function middleware(request: NextRequest) {
  if (!shouldProcessPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Detect locale first
  const localeResult = detectLocaleFromNextRequest(request, localizationConfig)

  // Check authentication
  const session = request.cookies.get('session')
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    // Redirect to login with locale-aware URL
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Create response with locale header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(localizationConfig.headerName, localeResult.locale)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Apply locale cookie if needed
  return applyLocaleToResponse(response, localeResult, localizationConfig)
}
```

### 5. Custom Path Matching

Use `createPathMatcher` to skip additional paths from locale processing:

```ts
// middleware.ts
import { createPathMatcher, createNextLocaleMiddleware } from '@js-monorepo/localization'

// Skip health checks, webhooks, and API routes
const shouldProcess = createPathMatcher({
  additionalSkipPatterns: [/^\/health/, /^\/webhooks/, /^\/api\/internal/],
})

export function middleware(request: NextRequest) {
  if (!shouldProcess(request.nextUrl.pathname)) {
    return NextResponse.next()
  }
  return handleLocale(request)
}
```

### 6. Email Templates with Localized Links

Use `getLocaleUrl` for generating locale-aware links in emails:

```ts
// lib/email/templates.ts
import { getLocaleUrl } from '@/lib/locale/locale-utils'

export function generateWelcomeEmail(userLocale: Locale, userName: string) {
  const dashboardUrl = getLocaleUrl(userLocale, '/dashboard')
  const settingsUrl = getLocaleUrl(userLocale, '/settings')

  return {
    subject: userLocale === 'el' ? 'Καλώς ήρθατε!' : 'Welcome!',
    html: `
      <p>Hi ${userName},</p>
      <p>Get started: <a href="${dashboardUrl}">Dashboard</a></p>
      <p>Settings: <a href="${settingsUrl}">Manage your account</a></p>
    `,
  }
}
```

### 7. Sitemap Generation

Use `getAlternateLocaleUrls` for multi-language sitemaps:

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { getAlternateLocaleUrls, locales } from '@/lib/locale/locale-utils'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['/', '/about', '/contact', '/pricing']

  return pages.flatMap((page) => {
    const alternates = getAlternateLocaleUrls(page)

    return locales.map((locale) => ({
      url: alternates[locale],
      lastModified: new Date(),
      alternates: {
        languages: alternates,
      },
    }))
  })
}
```

### 8. Validating Locale in Server Actions

Use `isValidLocale` to validate user-provided locales:

```ts
// app/actions/preferences.ts
'use server'
import { isValidLocale, localizationConfig } from '@/i18n/config'

export async function updateUserLocale(locale: string) {
  // Validate the locale before saving
  if (!isValidLocale(locale)) {
    throw new Error(`Invalid locale: ${locale}`)
  }

  // Save to database
  await db.user.update({
    where: { id: userId },
    data: { preferredLocale: locale },
  })

  return { success: true, locale }
}
```

### 9. Locale-Aware Redirects

Use `getDomainForLocale` for cross-domain redirects:

```ts
// app/api/redirect/route.ts
import { getDomainForLocale } from '@/i18n/config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const targetLocale = searchParams.get('locale') as Locale
  const targetPath = searchParams.get('path') ?? '/'

  const domain = getDomainForLocale(targetLocale)
  if (!domain) {
    return Response.json({ error: 'Invalid locale' }, { status: 400 })
  }

  return Response.redirect(`https://${domain}${targetPath}`)
}
```

### 10. Partial Configuration (Advanced)

Use partial config helpers for specific use cases:

```ts
import { createLocaleConfig, createDomainConfig, createLocaleValidator } from '@js-monorepo/localization'

// When you only need locale validation (no domain mapping)
const localeConfig = createLocaleConfig(['en', 'el', 'de'] as const, 'en')
const isValid = createLocaleValidator(localeConfig.locales)

// When you only need domain mapping (e.g., for a worker)
const domainConfig = createDomainConfig({ 'example.com': 'en', 'example.gr': 'el' }, 'en')
```

## License

MIT
