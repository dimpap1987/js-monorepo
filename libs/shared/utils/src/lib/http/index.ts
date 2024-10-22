import { ClientResponseType, SuccessResponse } from '@js-monorepo/types'
import { Request } from 'express'

export type Middleware = (
  next: (url: string, options: RequestInit) => Promise<Response>
) => (url: string, options: RequestInit) => Promise<Response>

export function getCookie(name: string) {
  const cookies = document.cookie.split(';')

  // Loop through each cookie
  for (let i = 0; i < cookies?.length; i++) {
    const cookie = cookies[i].trim()
    const [key, value] = cookie.split('=')

    if (key === name && value) {
      return value
    }
  }

  return null
}

export class HttpClientBuilder {
  private fullUrl = ''

  private middlewares: Middleware[] = []

  private options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  use(middleware: Middleware): HttpClientBuilder {
    this.middlewares.push(middleware)
    return this
  }

  private async runMiddleware(
    url: string,
    options: RequestInit
  ): Promise<Response> {
    const finalMiddleware = this.middlewares.reduce(
      (next, middleware) => middleware(next),
      this.fetch.bind(this)
    )

    return finalMiddleware(url, options)
  }

  private async fetch(url: string, options: RequestInit): Promise<Response> {
    const errorMessage = 'Something went wrong, please try again later...'
    try {
      return await fetch(url, options)
    } catch (error) {
      console.error('Fetch Error catch:', error)
      throw new Error(errorMessage)
    }
  }

  async execute<T>(): Promise<ClientResponseType<T>> {
    if (!this.fullUrl) {
      throw new Error('URL must be set before executing a request.')
    }

    if (this.options.method === 'GET') {
      delete this.options.body
    }
    const response = await this.runMiddleware(this.fullUrl, {
      ...this.options,
    })
    return this.handleResponse<T>(response)
  }

  private async handleResponse<T>(
    response: Response
  ): Promise<ClientResponseType<T>> {
    const errorMessage = 'Something went wrong, please try again later...'
    const contentType = response.headers.get('Content-Type')

    if (response.ok) {
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
  }

  withCredentials(): HttpClientBuilder {
    this.options.credentials = 'include'
    return this
  }

  withCsrf(csrfHeader = 'XSRF-TOKEN'): HttpClientBuilder {
    const csrfValue = getCookie(csrfHeader)
    if (csrfValue) {
      this.options.headers = {
        ...this.options.headers,
        [csrfHeader?.toUpperCase()]: csrfValue,
      }
    }
    return this
  }

  body(data: any): HttpClientBuilder {
    this.options.body = JSON.stringify(data)
    return this
  }

  withHeaders(headers: HeadersInit): HttpClientBuilder {
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

  url(url: string): HttpClientBuilder {
    this.fullUrl = url // Set the full URL
    return this
  }

  get(): HttpClientBuilder {
    this.options.method = 'GET'
    return this
  }

  post(): HttpClientBuilder {
    this.options.method = 'POST'
    return this
  }

  delete(): HttpClientBuilder {
    this.options.method = 'DELETE'
    return this
  }

  put(): HttpClientBuilder {
    this.options.method = 'PUT'
    return this
  }

  patch(): HttpClientBuilder {
    this.options.method = 'PATCH'
    return this
  }
}

export class HttpClientProxy {
  private middlewares: Middleware[] = []

  builder() {
    const builder = new HttpClientBuilder()

    // Add the shared middleware to the builder
    this.middlewares.forEach((middleware) => {
      builder.use(middleware)
    })

    return builder
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware)
  }
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
