declare global {
  namespace NodeJS {
    interface ProcessEnv extends Dict<string> {
      NODE_ENV: 'development' | 'production' | 'test'

      ACCESS_TOKEN_SECRET: string
      REFRESH_TOKEN_SECRET: string
      CORS_ORIGIN_DOMAINS: string

      GITHUB_CLIENT_ID: string
      GITHUB_CLIENT_SECRET: string
      GITHUB_REDIRECT_URL: string

      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      GOOGLE_REDIRECT_URL: string

      DATABASE_URL: string

      AUTH_LOGIN_REDIRECT: string
      AUTH_COOKIES_DOMAIN: string
      AUTH_COOKIES_SECURE: string

      LOGGER_LEVELS: string
    }
  }
}

export {}
