import { REDIS } from '@js-monorepo/nest/redis'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { RedisClientType } from '@redis/client'
import * as cookie from 'cookie'
import * as cookieParser from 'cookie-parser'
import { Socket } from 'socket.io'
import { ONLINE_KEY } from '../constants/constants'
@Injectable()
export class UserSocketService {
  constructor(@Inject(REDIS) private readonly redisClient: RedisClientType) {}

  async addSocketUser(
    {
      userId,
      socketId,
      pid,
    }: { userId: string | number; socketId: string; pid: number },
    ttl?: number
  ) {
    return this.redisClient.set(
      `${ONLINE_KEY}:${socketId}`,
      JSON.stringify({
        userId: userId,
        socket: socketId,
        pid: pid,
      }),
      ttl ? { EX: ttl } : undefined
    )
  }

  async removeSocketUserBySocketId(socketId: number | string) {
    return this.redisClient.del(`${ONLINE_KEY}:${socketId}`)
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

      return JSON.parse(sessionData)?.passport?.user as number
    } catch (e: any) {
      Logger.error('Error while getting user from websocket', e)
      return undefined
    }
  }
}
