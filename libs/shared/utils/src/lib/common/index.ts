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
