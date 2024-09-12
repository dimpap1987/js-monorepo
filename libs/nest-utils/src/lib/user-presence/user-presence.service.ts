import { Inject, Injectable, Logger } from '@nestjs/common'
import { RedisClientType } from '@redis/client'
import * as cookie from 'cookie'
import * as cookieParser from 'cookie-parser'
import { Socket } from 'socket.io'
import { REDIS } from '../redis'

@Injectable()
export class UserPresenceService {
  private readonly ONLINE_KEY = `${process.env['REDIS_NAMESPACE']}:online-users`

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
}
