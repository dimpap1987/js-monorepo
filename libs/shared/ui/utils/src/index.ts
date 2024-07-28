import { twMerge } from 'tailwind-merge'

export function cn(
  ...classNames: (
    | string
    | undefined
    | null
    | false
    | (string | undefined | null | false)[]
  )[]
): string {
  const flattenedClassNames = classNames
    .filter(Boolean)
    .flat(Infinity) as string[]
  return twMerge(...flattenedClassNames)
}

export function constructURIQueryString(
  searchParams: URLSearchParams | Record<string, any>
) {
  const params = new URLSearchParams(searchParams)
  // Convert search parameters to an array of [key, value] pairs and encode them
  const paramStrings = Array.from(params).map(([key, value]) => {
    if (key == 'pageIndex') {
      key = 'page'
    }
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
  })

  // Join the encoded key-value pairs with '&' to construct the query string
  return paramStrings?.length > 0 ? `?${paramStrings.join('&')}` : ''
}
