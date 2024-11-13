import { create } from 'zustand'

interface NotificationState {
  notificationCount: number
  latestReadNotificationId: number | undefined
  setNotificationCount: (count: number) => void
  markNotificationAsRead: (id: number) => void
  incrementNotificationCountByOne: () => void
}

// Create the Zustand store with typed state and actions
const useNotificationStore = create<NotificationState>((set) => ({
  notificationCount: 0,
  latestReadNotificationId: undefined,

  setNotificationCount: (count) =>
    set({ notificationCount: Math.max(0, count) }),

  incrementNotificationCountByOne: () =>
    set((state) => ({ notificationCount: state.notificationCount + 1 })),

  markNotificationAsRead: (id: number) =>
    set((state) => ({
      notificationCount: Math.max(0, state.notificationCount - 1),
      latestReadNotificationId: id,
    })),
}))

export { useNotificationStore }
