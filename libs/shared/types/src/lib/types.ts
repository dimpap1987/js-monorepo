export interface UserJWT {
  id: number
  username: string
  createdAt?: string
  lastLoggedIn?: string
  picture?: string
  provider?: string
  roles?: string[]
}
