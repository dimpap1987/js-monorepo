import { HttpClientProxy, Middleware } from '@js-monorepo/utils/http'

// const loggingMiddleware: Middleware =
//   (next) => async (url: string, options: RequestInit) => {
//     console.log('url request:', url)
//     const response = await next(url, options)
//     if (response.status === 401) {
//       // i use react how can i redirect it to /auth/login
//       console.log('OUPSSS')
//     }
//     return response
//   }

const proxy = new HttpClientProxy()
// proxy.use(loggingMiddleware)
export const API = proxy.builder()
