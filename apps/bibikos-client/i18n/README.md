# Internationalization (i18n)

Domain-based locale routing using `next-intl` for App Router.

> This app uses `@js-monorepo/localization` library for locale detection and middleware.
> See [Library Documentation](../../../libs/shared/localization/README.md) for details.

## Locale Configuration

| Locale | Domain       | Language          |
| ------ | ------------ | ----------------- |
| `en`   | `fitgym.com` | English (default) |
| `el`   | `fitgym.gr`  | Greek             |

## How It Works

**Locale Detection Priority:**

1. Query param `?locale=el` (dev only, persists to cookie)
2. Cookie `NEXT_LOCALE` (persisted preference)
3. Domain-based detection (`fitgym.gr` → Greek)

**Production:** Domain determines locale automatically.
**Development:** Use query param or local domain via `/etc/hosts`.

## Testing Locales

### Option 1: Query Parameter (localhost)

```
http://localhost:4200           → English
http://localhost:4200?locale=el → Greek (persists via cookie)
```

### Option 2: Local Domain (via /etc/hosts)

Add to `/etc/hosts`:

```
127.0.0.1 fitgym.com
127.0.0.1 fitgym.gr
```

Then access:

```
http://fitgym.com:4200 → English
http://fitgym.gr:4200  → Greek
```

## Usage

### Server Components

```tsx
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('home')
  return <h1>{t('title')}</h1>
}
```

### Client Components

```tsx
'use client'
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('common')
  return <button>{t('learnMore')}</button>
}
```

### Get Current Locale

```tsx
// Server
import { getLocale } from 'next-intl/server'
const locale = await getLocale()

// Client
import { useLocale } from 'next-intl'
const locale = useLocale()
```

### Locale Switcher Component

```tsx
import { LocaleSwitcher } from '@/components/locale-switcher'

export function Header() {
  return (
    <header>
      <LocaleSwitcher />
    </header>
  )
}
```

## Adding Translations

Edit `i18n/messages/{locale}.json`:

```json
{
  "home": {
    "title": "Welcome",
    "newKey": "New text"
  }
}
```

## File Structure

```
i18n/
├── config.ts        # App-specific locale config (uses @js-monorepo/localization)
├── request.ts       # next-intl server config
├── messages/
│   ├── en.json
│   └── el.json
├── README.md
lib/locale/
└── locale-utils.ts  # URL utilities for locale switching
middleware.ts        # Clean middleware using library helpers
components/
└── locale-switcher.tsx
```

## Adding a New Locale

1. Update `i18n/config.ts`:

   - Add to `locales` array
   - Add domain mapping in `getDomainLocaleMap()`
   - Add to `getDomainForLocale()`

2. Create `i18n/messages/{locale}.json`

3. Add env var: `NEXT_PUBLIC_{LOCALE}_DOMAIN`

4. Update `components/locale-switcher.tsx` `localeLabels`

## Environment Variables

```env
NEXT_PUBLIC_EN_DOMAIN=fitgym.com
NEXT_PUBLIC_EL_DOMAIN=fitgym.gr
```
