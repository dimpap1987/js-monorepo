export interface UserJWT {
  id: number
  username: string
  createdAt?: string
  lastLoggedIn?: string
  picture?: string
  provider?: string
  roles?: string[]
}

export type ClientResponseType =
  | {
      ok: true
      data: any
    }
  | {
      ok: false
      message?: string
      errors?: string[]
    }
