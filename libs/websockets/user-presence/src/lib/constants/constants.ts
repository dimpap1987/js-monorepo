export const ONLINE_KEY_LIST = `${process.env['REDIS_NAMESPACE']}:online:online-users-list`
export const SOCKET_KEY = `${process.env['REDIS_NAMESPACE']}:online:socket-user`

export const BrokerEvents = {
  onlineUsers: 'events:online-users',
  announcements: 'events:announcements',
}

export const WebSocketEvents = {
  onlineUsers: {
    subscribe: 'subscribe:online-users',
    emit: 'event:online-users',
  },
  announcements: {
    subscribe: 'subscribe:announcements',
    emit: 'event:announcements',
  },
}
