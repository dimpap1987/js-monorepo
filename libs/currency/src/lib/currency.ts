export const DEFAULT_CURRENCY = 'USD'

export const LOCAL_CURRENCY_MAP: Record<'en' | 'el', string> = {
  en: 'USD', // Default for English
  el: 'EUR', // Default for Greek
}

export const currencyDisplayOptions: Record<string, Intl.NumberFormatOptions> = {
  USD: { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  EUR: { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 },
}

export function formatCurrency(amount: number, locale: 'en' | 'el', currency?: string): string {
  if (amount === 0) {
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

  // Use Intl.NumberFormat for locale-sensitive formatting
  return new Intl.NumberFormat(locale, options).format(amount / 100)
}

export function convertEURtoUSD(amountEUR: number) {
  const EUR_TO_USD = 1.12
  return amountEUR * EUR_TO_USD
}
