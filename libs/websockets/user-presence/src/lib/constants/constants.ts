export const ONLINE_KEY_LIST = `${process.env['REDIS_NAMESPACE']}:online:online-users-list`
export const SOCKET_KEY = `${process.env['REDIS_NAMESPACE']}:online:socket-user`

export const Events = {
  onlineUsers: 'events:online-users',
  announcements: 'events:announcements',
  refreshSession: 'events:refresh-session',
} as const

export const Rooms = {
  admin: 'admin-room',
} as const
