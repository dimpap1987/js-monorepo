export type UserState = {
  isLoggedIn: boolean
  username?: string
}

export type UserStoreState = {
  data: UserState
  setUser: (user: UserState) => void
  removeUser: () => void
}
