import { REDIS } from '@js-monorepo/nest/redis'
import { SessionUserType } from '@js-monorepo/types'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { RedisClientType } from 'redis'
import { AuthService } from '../../common/services/interfaces/auth.service'
import { ServiceAuth } from '../../common/types'
import { USER_SESSION_KEY } from '../constants'

@Injectable()
export class AuthSessionUserCache {
  logger = new Logger(AuthSessionUserCache.name)

  constructor(
    @Inject(ServiceAuth) private authService: AuthService,
    @Inject(REDIS) private readonly redis: RedisClientType
  ) {}

  async findAuthCacheUserById(id: number | string) {
    const cacheUser = await this.redis.get(`${USER_SESSION_KEY}:${id}`)
    return cacheUser ? JSON.parse(cacheUser) : undefined
  }

  async saveAuthUserInCache(
    payload: { user: SessionUserType } | { id: number },
    ttl = 60
  ) {
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
          roles: userDb?.roles,
          createdAt: userDb?.createdAt,
          profileImage: userDb.providers[0]?.profileImage,
        } satisfies SessionUserType
      }

      await this.redis.set(
        `${USER_SESSION_KEY}:${userCache.id}`,
        JSON.stringify(userCache),
        {
          EX: ttl, // Set expiration time
        }
      )
      return userCache
    } catch (e: any) {
      this.logger.error('Error while saving Cache Auth user', e.stacκ)
      return undefined
    }
  }
}
