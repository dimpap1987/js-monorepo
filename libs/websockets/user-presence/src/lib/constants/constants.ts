const onlineUsersList = 'online:online-users-list'
const onlineSocketUser = 'online:socket-user'

export function getRedisOnlineKeyList() {
  return process.env['REDIS_NAMESPACE']
    ? `${process.env['REDIS_NAMESPACE']}:${onlineUsersList}`
    : onlineUsersList
}
export function getRedisSocketKey() {
  return process.env['REDIS_NAMESPACE']
    ? `${process.env['REDIS_NAMESPACE']}:${onlineSocketUser}`
    : onlineSocketUser
}

export const Events = {
  onlineUsers: 'events:online-users',
  announcements: 'events:announcements',
  refreshSession: 'events:refresh-session',
} as const

export const Rooms = {
  admin: 'admin-room',
} as const
