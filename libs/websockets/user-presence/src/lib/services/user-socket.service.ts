import { getRedisSessionPath } from '@js-monorepo/auth/nest/session'
import { REDIS } from '@js-monorepo/nest/redis'
import { SocketUser } from '@js-monorepo/types'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisClientType } from '@redis/client'
import cookie from 'cookie'
import cookieParser from 'cookie-parser'
import { Socket } from 'socket.io'

@Injectable()
export class UserSocketService {
  private logger = new Logger(UserSocketService.name)
  private readonly redisNamespace: string

  constructor(
    @Inject(REDIS) private readonly redisClient: RedisClientType,
    private readonly configService: ConfigService
  ) {
    const onlineSocketUser = 'online:socket-user'
    this.redisNamespace = this.configService.get<string>('REDIS_NAMESPACE')
      ? `${this.configService.get<string>('REDIS_NAMESPACE')}:${onlineSocketUser}`
      : onlineSocketUser
  }

  async addSocketUser({ userId, socket, pid, session }: SocketUser, ttl?: number) {
    return this.redisClient.set(
      `${this.redisNamespace}:${socket}`,
      JSON.stringify({
        userId: userId,
        socket: socket,
        pid: pid,
        session: session,
      }),
      ttl ? { EX: ttl } : undefined
    )
  }

  async removeSocketUserBySocketId(socketId: number | string) {
    return this.redisClient.del(`${this.redisNamespace}:${socketId}`)
  }

  async retrieveUserSessionFromSocket(socket: Socket) {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie as string)

      const decodedSession = cookieParser.signedCookie(
        cookies['JSESSIONID'],
        this.configService.get('SESSION_SECRET') ?? ''
      )

      const sessionData = await this.redisClient.get(`${getRedisSessionPath()}${decodedSession}`)

      if (!sessionData) return undefined

      const userId = JSON.parse(sessionData)?.passport?.user as number
      return {
        userId: userId,
        session: decodedSession,
      }
    } catch (e: any) {
      Logger.error('Error while getting user from websocket', e)
      return undefined
    }
  }

  async findSocketsByUserId(userId: string | number): Promise<string[]> {
    const userKeyPattern = `${this.redisNamespace}:*`
    let cursor = 0
    const matchingSockets: string[] = []

    try {
      do {
        const { cursor: newCursor, keys } = await this.redisClient.scan(cursor, {
          MATCH: userKeyPattern,
          COUNT: 100,
        })
        cursor = newCursor

        if (keys.length > 0) {
          for (const key of keys) {
            const value = await this.redisClient.get(key)
            if (value) {
              const socketUser = JSON.parse(value) as SocketUser
              if (socketUser?.userId === userId) {
                matchingSockets.push(socketUser.socket)
              }
            }
          }
        } else {
          this.logger.warn(`No keys found for pattern: ${userKeyPattern}`)
        }
      } while (cursor !== 0) // Continue until the cursor is back to zero

      this.logger.debug(`Found '${matchingSockets?.length}' sockets for user ID: ${userId}`)
      return matchingSockets
    } catch (error: any) {
      this.logger.error('Error while finding socket users', error.stack)
      return []
    }
  }
}
