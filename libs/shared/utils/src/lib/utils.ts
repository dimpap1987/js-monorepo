import { ClientResponseType, SuccessResponse } from '@js-monorepo/types'
import { Request } from 'express'

export function calculateThirtyMinutesFromNow() {
  // Get the current time in milliseconds
  const currentTime = new Date().getTime()

  // Calculate the time for 30 minutes from now (30 minutes * 60 seconds * 1000 milliseconds)
  const thirtyMinutesLater = currentTime + 30 * 60 * 1000

  // Convert the result to seconds (optional, depending on your needs)
  return Math.floor(thirtyMinutesLater / 1000)
}

export function getCookie(name: string) {
  const cookies = document.cookie.split(';')

  // Loop through each cookie
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    const [key, value] = cookie.split('=')

    if (key === name && value) {
      return value
    }
  }

  return null
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<ClientResponseType<T>> {
  const errorMessage = 'Something went wrong, please try again later...'
  try {
    const response = await fetch(url, options)
    const contentType = response.headers.get('Content-Type')

    if (response.ok) {
      // SUCCESS case
      const finalResponse: SuccessResponse<T> = {
        ok: true,
        httpStatusCode: response.status,
      }

      if (contentType?.includes('application/json')) {
        const data = await response.json()
        finalResponse.data = data
      }

      return finalResponse
    }

    // ERROR case

    if (contentType?.includes('application/json')) {
      const errorData = await response.json()
      return {
        ok: false,
        httpStatusCode: response.status,
        message: errorData.message ?? errorMessage,
        errors: errorData.errors || [],
      }
    }

    console.error('Unhandled Error')
    return {
      ok: false,
      httpStatusCode: response.status,
      message: errorMessage,
    }
  } catch (error) {
    console.error('Error catch:', error)
    return {
      ok: false,
      httpStatusCode: 503,
      message: errorMessage,
    }
  }
}

class HttpClientBuilder<T> {
  private url: string

  private options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  constructor(url: string) {
    this.url = url
  }

  withCsrf(csrfHeader = 'XSRF-TOKEN'): HttpClientBuilder<T> {
    const csrfValue = getCookie(csrfHeader)
    if (csrfValue) {
      this.options.headers = {
        ...this.options.headers,
        [csrfHeader?.toUpperCase()]: csrfValue,
      }
    }
    return this
  }

  body(data: any): HttpClientBuilder<T> {
    this.options.body = JSON.stringify(data)
    return this
  }

  withHeaders(headers: HeadersInit): HttpClientBuilder<T> {
    this.options.headers = {
      ...this.options.headers,
      ...headers,
    }
    if (!(this.options.headers as Record<string, string>)['Content-Type']) {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;(this.options.headers as Record<string, string>)['Content-Type'] =
        'application/json'
    }
    return this
  }

  withCredentials(): HttpClientBuilder<T> {
    this.options.credentials = 'include'
    return this
  }

  get(): HttpClientBuilder<T> {
    this.options.method = 'GET'
    return this
  }

  post(): HttpClientBuilder<T> {
    this.options.method = 'POST'
    return this
  }

  put(): HttpClientBuilder<T> {
    this.options.method = 'PUT'
    return this
  }

  async execute(): Promise<ClientResponseType<T>> {
    return request<T>(this.url, {
      ...this.options,
    })
  }
}

export const HttpClientProxy = {
  builder: <T>(url: string) => new HttpClientBuilder<T>(url),
}

export function getIPAddress(req: Request): string | undefined {
  if (!req) return undefined
  // Check for forwarded IP addresses (e.g., behind a proxy)
  const xForwardedFor = req.headers['x-forwarded-for']
  if (xForwardedFor) {
    const ips = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor
    return ips
  }

  const xRealIp = req.headers['x-real-ip']
  if (xRealIp) {
    return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp
  }

  return req.ip || undefined
}

export function getBrowserInfo(req: Request): string | undefined {
  if (!req) return undefined
  return req.headers['user-agent'] || undefined
}

export function isObjectDefinedOrEmpty(obj: object) {
  if (!obj) return true

  if (typeof obj !== 'object') {
    throw new TypeError('Input must be an object')
  }

  return Object.keys(obj)?.length === 0
}
