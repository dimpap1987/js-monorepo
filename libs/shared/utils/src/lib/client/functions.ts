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

export type ClientResponseType =
  | {
      ok: true
      data: any
    }
  | {
      ok: false
      message?: string
      errors?: string[]
    }

export async function requestPOST(
  url: string,
  payload?: unknown
): Promise<ClientResponseType> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    })

    const responseData = await response.json()
    if (!response.ok) {
      return {
        ok: false,
        message: responseData.message,
        errors: responseData.errors,
      }
    } else {
      return {
        ok: true,
        data: responseData,
      }
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      ok: false,
      message: 'Something went wrong, try again later...',
    }
  }
}
