export function calculateThirtyMinutesFromNow() {
  // Get the current time in milliseconds
  const currentTime = new Date().getTime()

  // Calculate the time for 30 minutes from now (30 minutes * 60 seconds * 1000 milliseconds)
  const thirtyMinutesLater = currentTime + 30 * 60 * 1000

  // Convert the result to seconds (optional, depending on your needs)
  return Math.floor(thirtyMinutesLater / 1000)
}

export function isObjectDefinedOrEmpty(obj: object) {
  if (!obj) return true

  if (typeof obj !== 'object') {
    throw new TypeError('Input must be an object')
  }

  return Object.keys(obj)?.length === 0
}

export function isPromise(pro: any) {
  return pro != null && (pro instanceof Promise || typeof pro.then === 'function')
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth

  if (width < 640) {
    return 'mobile'
  } else if (width >= 640 && width < 1024) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

export async function wait(miliSeconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, miliSeconds)
  })
}

export const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

export const compressAvatar = async (
  file: File,
  maxSize = 200, // Max dimensions for width or height (square avatar)
  quality = 0.7 // Compression quality
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const img = new Image()

      img.onload = () => {
        // Create a canvas for the compression
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Ensure the image is square by resizing
        const size = Math.min(img.width, img.height) // Use the smaller dimension
        canvas.width = maxSize
        canvas.height = maxSize

        // Calculate cropping points to make the image square
        const startX = (img.width - size) / 2
        const startY = (img.height - size) / 2

        // Draw the cropped and resized image
        ctx.drawImage(
          img,
          startX,
          startY,
          size, // Crop the smaller dimension
          size,
          0,
          0,
          maxSize,
          maxSize
        )

        // Export the compressed image as Base64
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }

      img.onerror = (err) => reject(new Error('Failed to load image'))

      img.src = event.target?.result as string
    }

    reader.onerror = (error) => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file) // Load the file
  })
}

// shalow comparison
export function compareObjects<T extends object>(obj1: T, obj2: T): Partial<T> | null {
  const differences: Partial<T> = {}

  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])

  for (const key of allKeys) {
    if (obj1[key as keyof T] !== obj2[key as keyof T]) {
      differences[key as keyof T] = obj2[key as keyof T]
    }
  }

  // If there are no differences, return null
  return Object.keys(differences).length > 0 ? differences : null
}

export async function tryCatch<T>(
  fn: (() => Promise<T>) | (() => T)
): Promise<{ result: T | null; error: any | null }> {
  try {
    const result = await fn() // Ensures result is always resolved
    return { result, error: null }
  } catch (error) {
    return { result: null, error }
  }
}

export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Buffer.from(array).toString('base64')
}

export function removePathNameFromUrl(url: string) {
  // Create a new URL object
  const parsedUrl = new URL(url) // Remove the pathname

  parsedUrl.pathname = ''

  return parsedUrl?.toString()
}

/**
 * Build a normalized list of allowed origins from environment variables.
 *
 * Priority:
 * - CORS_ALLOWED_ORIGINS (comma-separated)
 * - APP_URL
 */
export function getAllowedOriginsFromEnv(env: Record<string, string | undefined>): string[] {
  const raw = env.CORS_ALLOWED_ORIGINS ?? env.APP_URL ?? ''

  return raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

/**
 * Validate if a given Origin header value matches one of the allowed origins.
 *
 * Expects `allowedOrigins` to contain full origins (e.g. https://app.example.com)
 * and will compare against the `URL(origin).origin`.
 */
export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  // Allow non-browser requests (SSR, curl, internal services)
  if (!origin) {
    return true
  }

  try {
    const originUrl = new URL(origin)

    const isAllowed = allowedOrigins.some((allowed) => {
      try {
        return new URL(allowed).origin === originUrl.origin
      } catch {
        return false
      }
    })
    return isAllowed
  } catch (e) {
    return false
  }
}
