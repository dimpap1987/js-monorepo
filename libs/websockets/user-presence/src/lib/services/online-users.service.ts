import { RedisOnlineUsersKey, RedisSocketUserKey } from '@js-monorepo/auth/nest/common/types'
import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { REDIS } from '@js-monorepo/nest/redis'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { RedisClientType } from '@redis/client'
import { SocketUser } from '@js-monorepo/types'

@Injectable()
export class OnlineUsersService {
  private logger = new Logger(OnlineUsersService.name)

  constructor(
    @Inject(REDIS) private readonly redisClient: RedisClientType,
    @Inject(RedisOnlineUsersKey) private readonly onlineUsersKey: string,
    @Inject(RedisSocketUserKey) private readonly socketUserKey: string,
    private readonly authSessionUserCacheService: AuthSessionUserCacheService
  ) {}

  async getList(page = 1, limit = 100) {
    try {
      const entries = await this.redisClient.zRange(this.onlineUsersKey, 0, -1)

      const validSockets: Array<{ userId: number; socketId: string; session: string }> = []
      const entriesToRemove: string[] = []

      for (const entry of entries) {
        const [userId, socketId] = entry.split(':')
        const userIdNum = Number(userId)

        if (isNaN(userIdNum) || !socketId) {
          entriesToRemove.push(entry)
          continue
        }

        const socketKey = `${this.socketUserKey}${socketId}`
        const socketDataStr = await this.redisClient.get(socketKey)

        if (!socketDataStr) {
          entriesToRemove.push(entry)
          continue
        }

        try {
          const socketData = JSON.parse(socketDataStr) as SocketUser
          if (socketData.userId !== userIdNum) {
            entriesToRemove.push(entry)
            continue
          }

          validSockets.push({
            userId: userIdNum,
            socketId,
            session: socketData.session,
          })
        } catch {
          entriesToRemove.push(entry)
        }
      }

      if (entriesToRemove.length > 0) {
        await this.redisClient.zRem(this.onlineUsersKey, entriesToRemove)
      }

      const uniqueUserIds = [...new Set(validSockets.map((s) => s.userId))]
      const userDetailsMap = new Map<number, { id: number; username: string; roles: string[] }>()

      for (const userId of uniqueUserIds) {
        try {
          const userCache = await this.authSessionUserCacheService.findOrSaveAuthUserById(userId)
          if (userCache) {
            userDetailsMap.set(userId, {
              id: userCache.id,
              username: userCache.username,
              roles: userCache.roles,
            })
          }
        } catch (error: any) {
          this.logger.error(`Error fetching user ${userId}:`, error.stack)
        }
      }

      const userSessionMap = new Map<string, { userId: number; session: string; socketIds: string[] }>()

      for (const socket of validSockets) {
        const key = `${socket.userId}:${socket.session}`
        const existing = userSessionMap.get(key)

        if (existing) {
          existing.socketIds.push(socket.socketId)
        } else {
          userSessionMap.set(key, {
            userId: socket.userId,
            session: socket.session,
            socketIds: [socket.socketId],
          })
        }
      }

      const userList = Array.from(userSessionMap.values())
        .map(({ userId, session, socketIds }) => {
          const userDetails = userDetailsMap.get(userId)
          if (!userDetails) return null

          return {
            id: userDetails.id,
            username: userDetails.username,
            socketId: socketIds[0],
            socketCount: socketIds.length,
            roles: userDetails.roles,
            session: session,
          }
        })
        .filter((user): user is NonNullable<typeof user> => user !== null)

      const start = (page - 1) * limit
      const end = start + limit
      return userList.slice(start, end)
    } catch (e: any) {
      this.logger.error('Error while getting all online users', e.stack)
      return []
    }
  }

  async add(value: string): Promise<number | null> {
    if (!value || typeof value !== 'string') {
      this.logger.warn(`Invalid value provided to add: ${value}`)
      return null
    }

    const [userId, socketId] = value.split(':')
    if (!userId || !socketId || isNaN(Number(userId))) {
      this.logger.warn(`Invalid format for online user entry: ${value}. Expected "userId:socketId"`)
      return null
    }

    try {
      const score = Date.now()
      const result = await this.redisClient.zAdd(this.onlineUsersKey, {
        score,
        value,
      })
      return result
    } catch (error: any) {
      this.logger.error(`Error adding online user ${value}:`, error.stack)
      return null
    }
  }

  async remove(value: string): Promise<number | null> {
    if (!value || typeof value !== 'string') {
      return null
    }

    try {
      return await this.redisClient.zRem(this.onlineUsersKey, value)
    } catch (error: any) {
      this.logger.error(`Error removing online user ${value}:`, error.stack)
      return null
    }
  }

  async clear(): Promise<number> {
    try {
      return await this.redisClient.del(this.onlineUsersKey)
    } catch (error: any) {
      this.logger.error('Error clearing online users:', error.stack)
      return 0
    }
  }

  async removeByUserId(userId: number): Promise<number> {
    if (!userId || isNaN(userId)) {
      this.logger.warn(`Invalid userId provided: ${userId}`)
      return 0
    }

    try {
      const allMembers = await this.redisClient.zRange(this.onlineUsersKey, 0, -1)
      const userEntries = allMembers.filter((member) => {
        const [memberUserId] = member.split(':')
        return Number(memberUserId) === userId
      })

      if (userEntries.length === 0) {
        return 0
      }

      const removed = await this.redisClient.zRem(this.onlineUsersKey, userEntries)
      return removed
    } catch (error: any) {
      this.logger.error(`Error removing user ${userId} from online list:`, error.stack)
      return 0
    }
  }

  async getCount(): Promise<number> {
    try {
      return await this.redisClient.zCard(this.onlineUsersKey)
    } catch (error: any) {
      this.logger.error('Error getting online users count:', error.stack)
      return 0
    }
  }

  async isUserOnline(userId: number): Promise<boolean> {
    try {
      const allMembers = await this.redisClient.zRange(this.onlineUsersKey, 0, -1)
      return allMembers.some((member) => {
        const [memberUserId] = member.split(':')
        return Number(memberUserId) === userId
      })
    } catch (error: any) {
      this.logger.error(`Error checking if user ${userId} is online:`, error.stack)
      return false
    }
  }
}
