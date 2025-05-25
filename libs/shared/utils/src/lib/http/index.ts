import { ClientResponseType, ErrorResponse, SuccessResponse } from '@js-monorepo/types'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { Request } from 'express'

export interface CustomAxiosInstance extends AxiosInstance {
  get<T = any, R = ClientResponseType<T> & AxiosResponse>(url: string, config?: AxiosRequestConfig): Promise<R>

  patch<T = any, R = ClientResponseType<T> & AxiosResponse>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R>

  post<T = any, R = ClientResponseType<T> & AxiosResponse>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R>

  put<T = any, R = ClientResponseType<T> & AxiosResponse>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R>

  delete<T = any, R = ClientResponseType<T> & AxiosResponse>(url: string, config?: AxiosRequestConfig): Promise<R>
}

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

async function handleAxiosResponse<T>(response: AxiosResponse): Promise<ClientResponseType<T>> {
  const errorMessage = 'Something went wrong, please try again later...'

  // Check for a successful response
  if (response?.status >= 200 && response?.status < 300) {
    const finalResponse = {
      ok: true,
      status: response.status,
      data: response.data,
    }
    return finalResponse as SuccessResponse<T>
  }

  // For non-successful responses, handle errors
  const errorData = response?.data || {}
  return {
    ok: false,
    status: response?.status || 500,
    message: errorData.message || errorMessage,
    errors: errorData.errors || [],
  } as ErrorResponse
}

export function getIPAddressFromHeaders(req: Request): string | undefined {
  if (!req) return undefined

  // Cloudflare-specific header (most reliable when using Cloudflare)
  const cfConnectingIp = req.headers['cf-connecting-ip']
  if (cfConnectingIp) {
    return Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp
  }

  // Check for forwarded IP addresses (e.g., behind other proxies)
  const xForwardedFor = req.headers['x-forwarded-for']
  if (xForwardedFor) {
    const ips = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor
    // Take the first IP from the comma-separated list
    return ips.split(',')[0].trim()
  }

  const xRealIp = req.headers['x-real-ip']
  if (xRealIp) {
    return Array.isArray(xRealIp) ? xRealIp[0] : xRealIp
  }

  // Fallback to connection IP
  return req.ip || req.socket?.remoteAddress || undefined
}

export function getBrowserInfo(req: Request): string | undefined {
  if (!req) return undefined
  return req.headers['user-agent'] || undefined
}

const setupRequestWithCsrf = (config: InternalAxiosRequestConfig<any>) => {
  const csrfHeader = 'XSRF-TOKEN'
  const csrfValue = getCookie(csrfHeader)
  if (csrfValue) {
    config.headers[csrfHeader] = csrfValue
  }
  return config
}

const createApiClient = (handle401Error = false) => {
  const instance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_AUTH_URL}/api`,
    timeout: 10000,
    withCredentials: true,
  }) as CustomAxiosInstance

  instance.interceptors.request.use(setupRequestWithCsrf)

  // Conditionally add the response interceptor for 401 handling
  instance.interceptors.response.use(
    async (response) => {
      const transformedResponse = await handleAxiosResponse(response)
      return { ...response, ...transformedResponse }
    },
    async (error) => {
      if (handle401Error && error?.response?.status === 401) {
        window.location.replace('/auth/login')
        return
      }

      const transformedResponse = await handleAxiosResponse(error?.response)
      return { ...error, ...transformedResponse }
    }
  )

  return instance
}

export async function fetchUserIp() {
  try {
    const response = await fetch(`https://ipapi.co/json/`)
    return await response.json()
  } catch (e) {
    console.error(`Error while fetching user's ip`, e)
  }
}

// Instance with 401 error handling (redirect to login)
const apiClient = createApiClient(true)

// Instance without 401 error handling
const apiClientBase = createApiClient(false)

export { apiClient, apiClientBase }
