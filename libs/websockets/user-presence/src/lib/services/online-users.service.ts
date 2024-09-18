import { Inject, Injectable, Logger } from '@nestjs/common'
import { RedisClientType } from '@redis/client'
import { ONLINE_KEY_LIST } from '../constants'
import { UserCacheType } from '../types'
import { UserSocketService } from './user-socket.service'
import { REDIS } from '@js-monorepo/nest/redis'

@Injectable()
export class OnlineUsersService {
  logger = new Logger(OnlineUsersService.name)

  constructor(
    @Inject(REDIS) private readonly redisClient: RedisClientType,
    private readonly userSocketService: UserSocketService
  ) {}

  private async createOnlineUsersList(
    onlineUsers: Omit<UserCacheType, 'socketId'>[],
    ttl = 10
  ): Promise<void> {
    // Clear existing sorted set
    if (!onlineUsers?.length) return

    const members = onlineUsers.map(({ userId }) => ({
      score: Date.now(),
      value: `${userId}`,
    }))

    await this.redisClient.del(ONLINE_KEY_LIST)
    await this.redisClient.zAdd(ONLINE_KEY_LIST, members)
    this.redisClient.expire(ONLINE_KEY_LIST, ttl)
  }

  async getOnlineUserIds(
    page = 1,
    limit = 100
  ): Promise<Omit<UserCacheType, 'socketId'>[]> {
    try {
      const start = (page - 1) * limit
      const end = start + limit - 1

      const userIds = await this.redisClient.zRange(ONLINE_KEY_LIST, start, end)

      if (!userIds || userIds.length <= 0) return []

      return userIds.map((member) => ({
        userId: Number(member),
      }))
    } catch (e: any) {
      this.logger.error('Error while getting all online users', e.stack)
      return []
    }
  }

  async loadOnlineUsers() {
    try {
      const onlineUsers = await this.userSocketService.getSocketUsers()
      await this.createOnlineUsersList(onlineUsers)
      return await this.getOnlineUserIds()
    } catch (e: any) {
      this.logger.error('Error while loading online users', e.stack)
    }
    return []
  }
}
