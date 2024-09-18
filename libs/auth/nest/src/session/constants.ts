const USER_SESSION = 'user-session'

export const USER_SESSION_KEY = process.env['REDIS_NAMESPACE']
  ? `${process.env['REDIS_NAMESPACE']}:${USER_SESSION}`
  : `${USER_SESSION}`
