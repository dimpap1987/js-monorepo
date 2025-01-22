import { ForbiddenException, INestApplicationContext, Logger } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import { ServerOptions, Socket } from 'socket.io'
import { UserSocketService } from '../services/user-socket.service'

const createAuthMiddleware =
  (userSocketService: UserSocketService, logger: Logger) => async (socket: Socket, next: (err?: any) => void) => {
    try {
      const data = await userSocketService.retrieveUserSessionFromSocket(socket)

      if (!data?.userId || !data?.session) {
        throw new ForbiddenException('User not authenticated')
      }
      socket.user = { id: data.userId } // Attach user data to socket
      socket.session = data.session
      next()
    } catch (err) {
      logger.error('Authentication failed', err)
      next(new Error('FORBIDDEN'))
    }
  }

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name)

  private adapterConstructor?: ReturnType<typeof createAdapter>
  private _namespaces = ['presence']

  constructor(
    private app: INestApplicationContext,
    private namespaces?: string[]
  ) {
    super(app)
    if (namespaces) {
      this._namespaces = [...this._namespaces, ...namespaces]
    }
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: process.env['REDIS_URL'] })
    const subClient = pubClient.duplicate()

    await Promise.all([pubClient.connect(), subClient.connect()])

    this.adapterConstructor = createAdapter(pubClient, subClient)
  }

  override createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options)

    const userSocketService = this.app.get(UserSocketService)
    const authMiddleware = createAuthMiddleware(userSocketService, this.logger)

    // Use the middleware
    this._namespaces?.forEach((namespace) => {
      server.of(namespace).use(authMiddleware)
    })

    server.adapter(this.adapterConstructor)
    return server
  }
}
