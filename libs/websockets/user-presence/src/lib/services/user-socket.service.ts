import { RedisSessionKey, RedisSocketUserKey } from '@js-monorepo/auth/nest/common/types'
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

  constructor(
    @Inject(REDIS) private readonly redisClient: RedisClientType,
    @Inject(RedisSessionKey) private redisSessionPath: string,
    @Inject(RedisSocketUserKey) private readonly redisSocketUser: string,
    private readonly configService: ConfigService
  ) {}

  async addSocketUser({ userId, socket, pid, session }: SocketUser, ttl?: number) {
    return this.redisClient.set(
      `${this.redisSocketUser}${socket}`,
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
    return this.redisClient.del(`${this.redisSocketUser}${socketId}`)
  }

  async retrieveUserSessionFromSocket(socket: Socket) {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie as string)

      const decodedSession = cookieParser.signedCookie(
        cookies['JSESSIONID'],
        this.configService.get('SESSION_SECRET') ?? ''
      )

      const sessionData = await this.redisClient.get(`${this.redisSessionPath}${decodedSession}`)

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
    let cursor = 0
    const matchingSockets: string[] = []

    try {
      do {
        const { cursor: newCursor, keys } = await this.redisClient.scan(cursor, {
          MATCH: `${this.redisSocketUser}*`,
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
          this.logger.warn(`No keys found for pattern: ${`${this.redisSocketUser}*`}`)
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
