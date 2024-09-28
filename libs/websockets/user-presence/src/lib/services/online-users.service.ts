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
      const userPromises = onlineUsers.map(async (userId) => {
        const userCache =
          await this.authSessionUserCacheService.findOrSaveCacheUserById(
            Number(userId)
          )
        return {
          id: userCache?.id,
          username: userCache?.username,
          roles: userCache?.roles,
        }
      })

      return await Promise.all(userPromises)
    } catch (e: any) {
      this.logger.error('Error while getting all online users', e.stack)
      return []
    }
  }

  async addUser(userId: number | string): Promise<any> {
    if (userId === undefined || userId === null) return

    // Add the user to the sorted set with a score (timestamp)
    return this.redisClient.zAdd(ONLINE_KEY_LIST, {
      score: Date.now(),
      value: `${userId}`,
    })
  }

  async removeUser(userId: number | string): Promise<any> {
    if (userId === undefined || userId === null) return

    return this.redisClient.zRem(ONLINE_KEY_LIST, `${userId}`)
  }

  async clearUsers() {
    return this.redisClient.del(ONLINE_KEY_LIST)
  }
}
