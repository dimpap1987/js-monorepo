import { HttpClientProxy, Middleware } from '@js-monorepo/utils/http'

const unauthorized: Middleware =
  (next) => async (url: string, options: RequestInit) => {
    const response = await next(url, options)
    if (response.status === 401) {
      window.location.href = '/auth/login'
    }
    return response
  }

const proxy = new HttpClientProxy()
proxy.use(unauthorized)
export const API = proxy.builder()
