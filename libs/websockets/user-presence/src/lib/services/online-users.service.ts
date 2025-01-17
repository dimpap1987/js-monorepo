import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { REDIS } from '@js-monorepo/nest/redis'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { RedisClientType } from '@redis/client'
import { getRedisOnlineKeyList } from '../constants/constants'

@Injectable()
export class OnlineUsersService {
  logger = new Logger(OnlineUsersService.name)

  constructor(
    @Inject(REDIS) private readonly redisClient: RedisClientType,
    private readonly authSessionUserCacheService: AuthSessionUserCacheService
  ) {}

  async getList(page = 1, limit = 100) {
    try {
      const start = (page - 1) * limit
      const end = start + limit - 1

      const onlineUsers = await this.redisClient.zRange(
        getRedisOnlineKeyList(),
        start,
        end
      )
      const userPromises = onlineUsers.map(async (value) => {
        const [userId, socketId] = value.split(':')
        const userCache =
          await this.authSessionUserCacheService.findOrSaveAuthUserById(
            Number(userId)
          )
        return {
          id: userCache?.id,
          username: userCache?.username,
          socketId: socketId,
          roles: userCache?.roles,
        }
      })

      return await Promise.all(userPromises)
    } catch (e: any) {
      this.logger.error('Error while getting all online users', e.stack)
      return []
    }
  }

  async add(value: string): Promise<any> {
    if (value === undefined || value === null) return

    return this.redisClient.zAdd(getRedisOnlineKeyList(), {
      score: Date.now(),
      value: value,
    })
  }

  async remove(value: string): Promise<any> {
    if (value === undefined || value === null) return
    return this.redisClient.zRem(getRedisOnlineKeyList(), `${value}`)
  }

  async clear() {
    return this.redisClient.del(getRedisOnlineKeyList())
  }

  async removeByUserId(userId: number) {
    const userKeyPattern = `${userId}:*`
    let cursor = 0
    try {
      do {
        const { cursor: newCursor, members } = await this.redisClient.zScan(
          getRedisOnlineKeyList(),
          cursor,
          {
            MATCH: userKeyPattern,
            COUNT: 100,
          }
        )
        cursor = newCursor

        if (members.length > 0) {
          const deletePromises = members.map(async (member) => {
            await this.redisClient.zRem(getRedisOnlineKeyList(), member.value)
            this.logger.debug(`Deleted session with member: ${member.value}`)
          })
          await Promise.all(deletePromises)
        } else {
          this.logger.debug(`No members found for pattern: ${userKeyPattern}`)
        }
      } while (cursor !== 0)

      this.logger.debug(
        `Completed removal of sessions for user with ID: ${userId}`
      )
    } catch (error: any) {
      this.logger.error(
        'Error while removing user from online list',
        error.stack
      )
    }
  }
}
