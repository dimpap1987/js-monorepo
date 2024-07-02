import { ClientResponseType, SuccessResponse } from '@js-monorepo/types'

export function calculateThirtyMinutesFromNow() {
  // Get the current time in milliseconds
  const currentTime = new Date().getTime()

  // Calculate the time for 30 minutes from now (30 minutes * 60 seconds * 1000 milliseconds)
  const thirtyMinutesLater = currentTime + 30 * 60 * 1000

  // Convert the result to seconds (optional, depending on your needs)
  return Math.floor(thirtyMinutesLater / 1000)
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
