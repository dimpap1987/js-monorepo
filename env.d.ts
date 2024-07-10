declare global {
  namespace NodeJS {
    interface ProcessEnv extends Dict<string> {
      NODE_ENV: 'development' | 'production' | 'test'
      AUTH_COOKIE_DOMAIN_PROD: string
    }
  }
}

export {}
