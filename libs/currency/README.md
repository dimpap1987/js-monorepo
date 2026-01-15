## `@js-monorepo/currency`

Utility library for handling currencies and amounts across the monorepo.  
Keeps formatting and conversions consistent between frontend and backend.

### Exports

From `libs/currency/src/index.ts`:

- Everything from `./lib/currency`, including helpers like:
  - parsing/formatting money values
  - normalizing currency codes
  - comparing amounts

> For exact signatures, see `libs/currency/src/lib/currency.ts`.

### Typical Usage

```ts
import { formatCurrency, parseAmount, normalizeCurrency } from '@js-monorepo/currency'

const locale = 'el' // or 'en'
const currency = locale === 'el' ? 'EUR' : 'USD'

const amountInCents = parseAmount(29.99) // 2999
const formatted = formatCurrency(amountInCents, currency, locale)
// "29,99 €" for el / "€29.99" for en, depending on implementation
```

Use this library anywhere you need to:

- Display plan prices (must align with Stripe **EUR/ USD** prices)
- Show invoice totals and line item amounts
- Normalize user input for amounts before sending to the API
