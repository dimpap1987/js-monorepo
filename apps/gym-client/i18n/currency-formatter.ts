import { localeCurrencyMap, currencyDisplayOptions, DEFAULT_CURRENCY } from '../i18n/currency-config'
import { Locale } from '../i18n/config'

export function formatCurrency(amount: number, locale: Locale, currency?: string): string {
  let effectiveCurrency = currency

  if (!effectiveCurrency) {
    effectiveCurrency = localeCurrencyMap[locale] || DEFAULT_CURRENCY
  }

  const options = currencyDisplayOptions[effectiveCurrency] || {
    style: 'currency',
    currency: effectiveCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }

  // Use Intl.NumberFormat for locale-sensitive formatting
  return new Intl.NumberFormat(locale, options).format(amount / 100)
}
