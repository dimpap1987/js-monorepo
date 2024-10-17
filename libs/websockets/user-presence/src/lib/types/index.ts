export type UserCacheType = {
  userId: number | string
  socketId: number
}

declare module 'socket.io' {
  interface Socket {
    user: { id: number }
    session: string
  }
}
