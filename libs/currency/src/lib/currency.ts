export const DEFAULT_CURRENCY = 'USD'

export const LOCAL_CURRENCY_MAP: Record<'en' | 'el', string> = {
  en: 'USD', // Default for English
  el: 'EUR', // Default for Greek
}

export const currencyDisplayOptions: Record<string, Intl.NumberFormatOptions> = {
  USD: { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  EUR: { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 },
}

/**
 * Convert cents (smallest currency unit) to amount (dollars/euros)
 * Stripe and most payment systems store prices in cents
 * @param cents - Amount in cents (e.g., 2000 = $20.00)
 * @returns Amount in dollars/euros (e.g., 20.00)
 */
export function centsToAmount(cents: number): number {
  return cents / 100
}

/**
 * Convert amount (dollars/euros) to cents (smallest currency unit)
 * Used when sending prices to payment APIs
 * @param amount - Amount in dollars/euros (e.g., 20.00)
 * @returns Amount in cents (e.g., 2000)
 */
export function amountToCents(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Format currency amount from cents to formatted string
 * @param cents - Amount in cents (e.g., 2000)
 * @param locale - Locale code ('en' | 'el')
 * @param currency - Currency code (e.g., 'USD', 'EUR'). If not provided, uses locale default
 * @returns Formatted currency string (e.g., "$20.00" or "€20,00")
 */
export function formatCurrency(cents: number, locale: 'en' | 'el', currency?: string): string {
  if (cents === 0) {
    return '0'
  }
  let effectiveCurrency = currency

  if (!effectiveCurrency) {
    effectiveCurrency = LOCAL_CURRENCY_MAP[locale] || DEFAULT_CURRENCY
  }

  const options = currencyDisplayOptions[effectiveCurrency] || {
    style: 'currency',
    currency: effectiveCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }

  const amount = centsToAmount(cents)
  // Use Intl.NumberFormat for locale-sensitive formatting
  return new Intl.NumberFormat(locale, options).format(amount)
}

/**
 * Format price with currency symbol (without full formatting)
 * Useful for displaying prices in components where you want more control
 * @param cents - Amount in cents (e.g., 2000)
 * @param locale - Locale code ('en' | 'el')
 * @param currency - Currency code (e.g., 'USD', 'EUR'). If not provided, uses locale default
 * @returns Formatted price string (e.g., "$20.00" or "€20,00")
 */
export function formatPrice(cents: number, locale: 'en' | 'el', currency?: string): string {
  return formatCurrency(cents, locale, currency)
}

/**
 * Format price with interval (e.g., "$20.00/month" or "€20,00/month")
 * @param cents - Amount in cents (e.g., 2000)
 * @param interval - Interval string (e.g., "month", "year")
 * @param locale - Locale code ('en' | 'el')
 * @param currency - Currency code (e.g., 'USD', 'EUR'). If not provided, uses locale default
 * @returns Formatted price with interval (e.g., "$20.00/month")
 */
export function formatPriceWithInterval(
  cents: number,
  interval: string,
  locale: 'en' | 'el',
  currency?: string
): string {
  const formattedPrice = formatPrice(cents, locale, currency)
  return `${formattedPrice}/${interval}`
}

/**
 * Get currency symbol for a given currency code
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @param locale - Locale code ('en' | 'el')
 * @returns Currency symbol (e.g., "$", "€")
 */
export function getCurrencySymbol(currency: string, locale: 'en' | 'el' = 'en'): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(0).replace(/\d/g, '').trim()
}

/**
 * Get default currency for a locale
 * @param locale - Locale code ('en' | 'el')
 * @returns Currency code (e.g., 'USD', 'EUR')
 */
export function getDefaultCurrency(locale: 'en' | 'el'): string {
  return LOCAL_CURRENCY_MAP[locale] || DEFAULT_CURRENCY
}

export function convertEURtoUSD(amountEUR: number) {
  const EUR_TO_USD = 1.12
  return amountEUR * EUR_TO_USD
}
