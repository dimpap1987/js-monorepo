declare global {
  namespace NodeJS {
    interface ProcessEnv extends Dict<string> {
      NODE_ENV: 'development' | 'production' | 'test'

      APP_URL: string

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
      AUTH_COOKIES_SAME_SITE: boolean | 'lax' | 'strict' | 'none' | undefined | ''

      LOGGER_LEVEL: string
    }
  }
}

export {}
