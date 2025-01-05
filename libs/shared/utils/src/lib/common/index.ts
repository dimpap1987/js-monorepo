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

export function getCurrentDateFormatted() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isPromise(pro: any) {
  return (
    pro != null && (pro instanceof Promise || typeof pro.then === 'function')
  )
}

export function getColorizedText(
  text: number | string,
  ansiC0de = '\x1b[33m'
): string {
  // ANSI escape codes for colorization
  const reset = '\x1b[0m'

  return `${ansiC0de}${text}${reset}`
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
export function compareObjects<T extends object>(
  obj1: T,
  obj2: T
): Partial<T> | null {
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

export function deepCloneAndUpdate<T>(prevState: T, updates: Partial<T>): T {
  return {
    ...prevState,
    ...updates,
    // Recursively deep clone nested objects (if any)
    // Ensure you're not accidentally modifying nested structures directly
    ...Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [
        key,
        value && typeof value === 'object' ? structuredClone(value) : value,
      ])
    ),
  }
}
