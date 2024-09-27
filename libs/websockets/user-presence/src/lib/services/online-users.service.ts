import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { REDIS } from '@js-monorepo/nest/redis'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { RedisClientType } from '@redis/client'
import { ONLINE_KEY_LIST } from '../constants/constants'

@Injectable()
export class OnlineUsersService {
  logger = new Logger(OnlineUsersService.name)

  constructor(
    @Inject(REDIS) private readonly redisClient: RedisClientType,
    private readonly authSessionUserCacheService: AuthSessionUserCacheService
  ) {}

  async getOnlineUsersList(page = 1, limit = 100) {
    try {
      const start = (page - 1) * limit
      const end = start + limit - 1

      const onlineUsers = await this.redisClient.zRange(
        ONLINE_KEY_LIST,
        start,
        end
      )
      return onlineUsers.map((u) => JSON.parse(u))
    } catch (e: any) {
      this.logger.error('Error while getting all online users', e.stack)
      return []
    }
  }

  async addUser(userId: number | string): Promise<any> {
    const user = await this.authSessionUserCacheService.findOrSaveCacheUserById(
      Number(userId)
    )
    if (!user) return

    // Add the user to the sorted set with a score (timestamp)
    return this.redisClient.zAdd(ONLINE_KEY_LIST, {
      score: Date.now(),
      value: JSON.stringify({
        id: user.id,
        username: user.username,
        roles: user.roles,
      }),
    })
  }

  async removeUser(userId: number | string): Promise<any> {
    const user = await this.authSessionUserCacheService.findOrSaveCacheUserById(
      Number(userId)
    )
    if (!user) return

    return this.redisClient.zRem(
      ONLINE_KEY_LIST,
      JSON.stringify({
        id: user.id,
        username: user.username,
        roles: user.roles,
      })
    )
  }

  async clearUsers() {
    return this.redisClient.del(ONLINE_KEY_LIST)
  }
}
