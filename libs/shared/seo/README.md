## `@js-monorepo/seo`

SEO utilities for Next.js apps in this monorepo.  
Provides site‑wide configuration, helpers for `generateMetadata`, and structured data (JSON‑LD) generators.

### Exports

From `libs/shared/seo/src/index.ts`:

- **Site configuration**
  - `configureSite`, `getSiteConfig`, `createSiteConfigFromEnv`, `SiteConfig`
- **Metadata**
  - `generateMetadata`, `SEOProps`
- **Structured data**
  - `generateStructuredData`
  - `StructuredDataType`, `OrganizationData`, `WebSiteData`, `ArticleData`, `BreadcrumbItem`, `ProductData`

### Basic Setup

Configure the site once on app bootstrap (commonly in `app/layout.tsx` or a config module):

```ts
// apps/gym-client/app/config/seo.ts
import { configureSite } from '@js-monorepo/seo'

configureSite({
  name: 'Gym App',
  description: 'Modern gym management and member portal.',
  url: 'https://example.com',
  locale: 'en-US',
  twitterHandle: '@gym',
})
```

Or derive config from environment:

```ts
import { createSiteConfigFromEnv, configureSite } from '@js-monorepo/seo'

configureSite(
  createSiteConfigFromEnv({
    defaultLocale: 'en-US',
  }),
)
```

### Using With Next.js `generateMetadata`

```ts
// apps/gym-client/app/(main)/page.tsx
import { generateMetadata } from '@js-monorepo/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = generateMetadata({
  title: 'Dashboard',
  description: 'Your membership, workouts, and progress in one place.',
  path: '/',
})

export default function Page() {
  return <main>...</main>
}
```

You can override per‑page settings (title, description, canonical URL, Open Graph, etc.) via the `SEOProps` shape.

### Structured Data (JSON‑LD)

```tsx
// apps/gym-client/app/(main)/pricing/page.tsx
import { generateStructuredData, StructuredDataType } from '@js-monorepo/seo'

const productJsonLd = generateStructuredData({
  type: StructuredDataType.Product,
  data: {
    name: 'Pro Membership',
    description: 'Full access to gym facilities and classes.',
    price: 29.99,
    currency: 'USD', // or 'EUR' depending on locale
  },
})

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {/* ...rest of page */}
    </>
  )
}
```

Use this to improve search visibility for key pages like pricing, classes, and blog posts.

