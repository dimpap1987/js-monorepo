import {
  ClientResponseType,
  ErrorResponse,
  SuccessResponse,
} from '@js-monorepo/types'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Request } from 'express'

export interface CustomAxiosInstance extends AxiosInstance {
  get<T = any, R = ClientResponseType<T> & AxiosResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R>

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

  delete<T = any, R = ClientResponseType<T> & AxiosResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R>
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

async function handleAxiosResponse<T>(
  response: AxiosResponse
): Promise<ClientResponseType<T>> {
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

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_AUTH_URL}/api`,
  timeout: 10000,
  withCredentials: true,
}) as CustomAxiosInstance

apiClient.interceptors.request.use((config) => {
  const csrfHeader = 'XSRF-TOKEN'
  const csrfValue = getCookie(csrfHeader)

  if (csrfValue) {
    config.headers[csrfHeader] = csrfValue
  }

  return config
})

apiClient.interceptors.response.use(
  async (response) => {
    const transformedResponse = await handleAxiosResponse(response)
    return {
      ...response,
      ...transformedResponse,
    }
  },
  async (error) => {
    if (error?.response?.status === 401) {
      window.location.replace('/auth/login')
      return
    }

    const transformedResponse = await handleAxiosResponse(error?.response)

    return { ...error, ...transformedResponse }
  }
)

export { apiClient }
