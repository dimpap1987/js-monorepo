import type { LocaleConfig } from './types'

/**
 * Creates a type guard function for validating locales
 *
 * @example
 * const isValidLocale = createLocaleValidator(['en', 'el'] as const)
 * isValidLocale('en') // true
 * isValidLocale('fr') // false
 */
export function createLocaleValidator<TLocale extends string>(
  locales: readonly TLocale[]
): (value: unknown) => value is TLocale {
  const localeSet = new Set<string>(locales)

  return (value: unknown): value is TLocale => {
    return typeof value === 'string' && localeSet.has(value)
  }
}

/**
 * Creates a locale validator from a config object
 */
export function createLocaleValidatorFromConfig<TLocale extends string>(
  config: Pick<LocaleConfig<TLocale>, 'locales'>
): (value: unknown) => value is TLocale {
  return createLocaleValidator(config.locales)
}
