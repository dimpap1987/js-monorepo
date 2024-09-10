import { REDIS } from '@js-monorepo/nest/redis'
import { SessionUserType } from '@js-monorepo/types'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportSerializer } from '@nestjs/passport'
import { RedisClientType } from 'redis'
import { AuthService } from '../../common/services/interfaces/auth.service'
import { ServiceAuth } from '../../common/types'

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @Inject(ServiceAuth) private authService: AuthService,
    @Inject(REDIS) private readonly redis: RedisClientType,
    private readonly configService: ConfigService
  ) {
    super()
  }

  serializeUser(user: { user: SessionUserType }, done: CallableFunction) {
    done(null, user?.user?.id)
  }

  async deserializeUser(userId: string, done: CallableFunction) {
    const REDIS_NAMESPACE = this.configService.get('REDIS_NAMESPACE')
    const cacheKey = `${REDIS_NAMESPACE}:users-session:${userId}`
    const cachedUser = await this.redis.get(cacheKey)

    if (cachedUser) {
      // If user found in cache, parse and return it
      done(null, JSON.parse(cachedUser))
    } else {
      // If not found in cache, fetch from the database
      const user = await this.authService.findAuthUserById(Number(userId))
      if (user) {
        const userData = {
          user: {
            id: user.id,
            username: user.username,
            roles: user.roles,
            createdAt: user.createdAt,
            profileImage: user.providers[0]?.profileImage,
          },
        }

        await this.redis.set(cacheKey, JSON.stringify(userData), {
          EX: 60, // Set expiration time to seconds
        })

        done(null, userData)
      } else {
        done(null, null)
      }
    }
  }
}
