import { create } from 'zustand'
import { UserStoreState } from '../types'

const useUserStore = create<UserStoreState>()((set) => ({
  data: {
    isLoggedIn: false,
  },
  setUser: (user) =>
    set(() => ({
      data: {
        isLoggedIn: !!user,
        username: user.username,
      },
    })),
  removeUser: () =>
    set(() => ({
      data: {
        isLoggedIn: false,
      },
    })),
}))

export { useUserStore }
