const USER_SESSION = 'user-session'

export const getRedisUserSessionKey = () => {
  return process.env['REDIS_NAMESPACE']
    ? `${process.env['REDIS_NAMESPACE']}:${USER_SESSION}`
    : `${USER_SESSION}`
}
