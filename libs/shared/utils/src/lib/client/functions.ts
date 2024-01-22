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
