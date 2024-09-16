import { Inject, Injectable, Logger } from '@nestjs/common'
import { RedisClientType } from '@redis/client'
import * as cookie from 'cookie'
import * as cookieParser from 'cookie-parser'
import { Socket } from 'socket.io'
import { REDIS } from '../redis'
import { UserCacheType } from './types'

@Injectable()
export class UserPresenceService {
  private readonly ONLINE_KEY = `${process.env['REDIS_NAMESPACE']}:online-users`

  logger = new Logger(UserPresenceService.name)

  constructor(@Inject(REDIS) private readonly redisClient: RedisClientType) {}

  async addOnlineUser(
    userId: number | string,
    socketId: string
  ): Promise<void> {
    await this.redisClient.set(
      `${this.ONLINE_KEY}:${socketId}`,
      JSON.stringify({
        userId: userId,
        socket: socketId,
      }),
      { EX: 10 }
    )
  }

  async removeOnlineUser(socketId: number | string): Promise<void> {
    await this.redisClient.del(`${this.ONLINE_KEY}:${socketId}`)
  }

  async getUserIdFromSocket(socket: Socket) {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie as string)

      const decodedSession = cookieParser.signedCookie(
        cookies['JSESSIONID'],
        process.env['SESSION_SECRET'] ?? ''
      )

      const sessionData = await this.redisClient.get(
        `${process.env['REDIS_NAMESPACE']}:sessions:${decodedSession}`
      )

      if (!sessionData) return undefined

      return JSON.parse(sessionData)?.passport?.user
    } catch (e: any) {
      Logger.error('Error while getting user from websocket', e)
      return undefined
    }
  }

  async getAllOnlineUsers(): Promise<Omit<UserCacheType, 'socketId'>[]> {
    try {
      const keys = await this.redisClient.keys(`${this.ONLINE_KEY}:*`)
      const userInfos = await Promise.all(
        keys.map(async (key) => {
          const userInfo = await this.redisClient.get(key)
          return userInfo ? JSON.parse(userInfo) : null
        })
      )

      return userInfos.filter(Boolean).map(({ userId }) => ({ userId }))
    } catch (e: any) {
      this.logger.error('Error while getting all online users', e.stach)
      return []
    }
  }
}
