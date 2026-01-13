import { Locale } from './config'

export const localeCurrencyMap: Record<Locale, string> = {
  en: 'USD', // Default for English
  el: 'EUR', // Default for Greek
}

export const currencyDisplayOptions: Record<string, Intl.NumberFormatOptions> = {
  USD: { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 },
  EUR: { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 },
}

export const DEFAULT_CURRENCY = 'USD'
