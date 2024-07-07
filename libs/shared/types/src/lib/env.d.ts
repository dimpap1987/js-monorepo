declare global {
  namespace NodeJS {
    interface ProcessEnv extends Dict<string> {
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

export {}
