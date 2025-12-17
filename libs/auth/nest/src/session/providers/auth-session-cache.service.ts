import { REDIS } from '@js-monorepo/nest/redis'
import { SessionObject, SessionUserType } from '@js-monorepo/types'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { RedisClientType } from 'redis'
import { AuthException } from '../../common/exceptions/api-exception'
import { AuthService } from '../../common/services/interfaces/auth.service'
import { RedisSessionKey, RedisUserSessionKey, ServiceAuth } from '../../common/types'

interface UserSession {
  key: string
  session: SessionObject
}

@Injectable()
export class AuthSessionUserCacheService {
  private logger = new Logger(AuthSessionUserCacheService.name)

  constructor(
    @Inject(ServiceAuth) private authService: AuthService,
    @Inject(REDIS) private readonly redis: RedisClientType,
    @Inject(RedisSessionKey) private readonly redisSessionKey: string,
    @Inject(RedisUserSessionKey) private readonly redisUserSessionKey: string
  ) {}

  async findOrSaveAuthUserById(id: number, ttl = 60): Promise<SessionUserType | undefined> {
    try {
      const userCache = await this.findAuthUserById(id)

      if (userCache) return userCache

      return (await this.saveAuthUserInCache({ id }, ttl)) as SessionUserType
    } catch (e: any) {
      this.logger.error('Error while retriving or saving cache user', e.stack)
      return undefined
    }
  }

  async findAuthUserById(id: number): Promise<SessionUserType | undefined> {
    const cacheUser = await this.redis.get(`${this.redisUserSessionKey}${id}`)
    return cacheUser ? JSON.parse(cacheUser) : undefined
  }

  async saveAuthUserInCache(payload: { user: SessionUserType } | { id: number }, ttl = 60) {
    try {
      let userCache: SessionUserType | null = null

      if ('user' in payload) {
        userCache = {
          ...payload.user,
        }
      } else {
        const userDb = await this.authService.findAuthUserById(payload.id)

        if (!userDb) return

        userCache = {
          id: userDb.id,
          username: userDb?.username,
          email: userDb?.email,
          roles: userDb.userRole?.map((userRole) => userRole.role.name),
          createdAt: userDb?.createdAt,
          profile: {
            id: userDb.userProfiles?.[0]?.id,
            image: userDb.userProfiles?.[0]?.profileImage,
            provider: userDb.userProfiles?.[0]?.provider?.name,
          },
        } satisfies SessionUserType
      }

      await this.redis.set(`${this.redisUserSessionKey}${userCache.id}`, JSON.stringify(userCache), {
        EX: ttl, // Set expiration time
      })
      return userCache
    } catch (e: any) {
      this.logger.error('Error while saving Cache Auth user', e.stack)
      return undefined
    }
  }

  async fetchUserSessionsByUserId(userId: number): Promise<UserSession[]> {
    let cursor = 0
    const userSessions: UserSession[] = []

    do {
      const { cursor: newCursor, keys } = await this.redis.scan(cursor, {
        MATCH: `${this.redisSessionKey}*`,
        COUNT: 100, // Optional count for performance
      })

      cursor = newCursor

      if (keys.length > 0) {
        const sessionPromises = keys.map(async (key: string) => {
          const sessionData = await this.redis.get(key)
          if (sessionData) {
            const sessionObject: SessionObject = JSON.parse(sessionData)
            if (sessionObject.passport?.user === userId) {
              userSessions.push({ key, session: sessionObject })
            }
          }
        })

        await Promise.all(sessionPromises)
      }
    } while (cursor !== 0)

    return userSessions
  }

  async deleteAuthUserSessions(userId: number) {
    try {
      const userSessions = await this.fetchUserSessionsByUserId(userId)
      if (userSessions.length === 0) {
        this.logger.warn(`No sessions found for user with id: ${userId}`)
        return
      }

      // Delete each session
      const deletePromises = userSessions.map(async (userSession) => {
        await this.redis.del(userSession.key)
        this.logger.log(`Deleted session for user with id: ${userId}, session key: ${userSession.key}`)
      })

      await Promise.all(deletePromises)

      this.logger.log(`All sessions deleted for user with id: ${userId}`)
    } catch (error: any) {
      this.logger.error('Error while deleting user session', error.stack)
      throw new AuthException(HttpStatus.BAD_REQUEST, 'ERROR_USER_SESSION_DELETION')
    }
  }

  async invalidateAuthUserInCache(userId: number) {
    return this.redis.del(`${this.redisUserSessionKey}${userId}`)
  }
}
