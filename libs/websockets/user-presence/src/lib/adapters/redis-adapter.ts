import { REDIS } from '@js-monorepo/nest/redis'
import { ForbiddenException, INestApplicationContext, Logger } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { RedisClientType } from 'redis'
import { ServerOptions, Socket } from 'socket.io'
import { UserSocketService } from '../services/user-socket.service'

const createAuthMiddleware =
  (userSocketService: UserSocketService, logger: Logger, isShuttingDown: () => boolean) =>
  async (socket: Socket, next: (err?: any) => void) => {
    // Reject new connections during shutdown
    if (isShuttingDown()) {
      logger.debug('Rejecting new WebSocket connection during shutdown')
      socket.disconnect(true)
      return next(new Error('SERVER_SHUTTING_DOWN'))
    }

    try {
      const data = await userSocketService.retrieveUserSessionFromSocket(socket)

      if (!data?.userId || !data?.session) {
        throw new ForbiddenException('User not authenticated')
      }
      socket.user = { id: data.userId } // Attach user data to socket
      socket.session = data.session
      next()
    } catch (err: any) {
      // Handle Redis closure gracefully during shutdown
      if (err?.message?.includes('closed') || err?.message?.includes('The client is closed')) {
        logger.debug('Redis closed during WebSocket authentication (shutdown in progress)')
        socket.disconnect(true)
        return next(new Error('SERVER_SHUTTING_DOWN'))
      }
      logger.error('Authentication failed', err.stack)
      next(new Error('FORBIDDEN'))
    }
  }

export class RedisIoAdapter extends IoAdapter {
  private readonly logger = new Logger(RedisIoAdapter.name)

  private adapterConstructor?: ReturnType<typeof createAdapter>
  private _namespaces = ['presence']
  private _isShuttingDown = false
  private _ioServer: any = null

  constructor(
    private app: INestApplicationContext,
    private namespaces?: string[]
  ) {
    super(app)
    if (namespaces) {
      this._namespaces = [...this._namespaces, ...namespaces]
    }
  }

  /**
   * Gets the client name from the main Redis client (set by RedisModule)
   * Falls back to 'api' if not available
   */
  private async getClientName(pubClient: RedisClientType): Promise<string> {
    try {
      const mainClientName = (await pubClient.sendCommand(['CLIENT', 'GETNAME'])) as string | null
      if (mainClientName && mainClientName !== '(nil)' && mainClientName !== '') {
        return mainClientName.toString().trim()
      }
    } catch {
      this.logger.warn('Failed to get Redis client name from pubClient')
    }

    return 'api'
  }

  /**
   * Sets the client name for the subClient connection for tracking
   */
  private async setSubClientName(
    subClient: { sendCommand: (command: string[]) => Promise<unknown> },
    clientName: string
  ): Promise<void> {
    try {
      await subClient.sendCommand(['CLIENT', 'SETNAME', `${clientName}-websocket-sub`])
      this.logger.debug(`Redis subClient name set: ${clientName}-websocket-sub`)
    } catch (error: any) {
      this.logger.warn(`Failed to set Redis subClient name: ${error?.message}`)
    }
  }

  /**
   * Mark adapter as shutting down and close all WebSocket connections
   */
  async shutdown(): Promise<void> {
    if (this._isShuttingDown) {
      return
    }

    this._isShuttingDown = true
    this.logger.debug('RedisIoAdapter: Starting WebSocket shutdown')

    if (this._ioServer) {
      // Close all namespaces
      this._namespaces.forEach((ns) => {
        const namespace = this._ioServer.of(ns)
        if (namespace) {
          namespace.disconnectSockets(true)
          this.logger.debug(`RedisIoAdapter: Disconnected all sockets in namespace: ${ns}`)
        }
      })
    }

    this.logger.debug('RedisIoAdapter: WebSocket shutdown complete')
  }

  private isShuttingDown(): boolean {
    return this._isShuttingDown
  }

  async connectToRedis(): Promise<void> {
    const pubClient = this.app.get<RedisClientType>(REDIS)
    const subClient = pubClient.duplicate()
    await subClient.connect()

    // Get the name from pubClient (set by RedisModule) and use it as base for subClient name
    // Don't rename pubClient - it already has a name from RedisModule (e.g., 'bibikos-api')
    const clientName = await this.getClientName(pubClient)
    await this.setSubClientName(subClient, clientName)

    this.adapterConstructor = createAdapter(pubClient, subClient)
  }

  override createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options)
    this._ioServer = server

    const userSocketService = this.app.get(UserSocketService)
    const authMiddleware = createAuthMiddleware(userSocketService, this.logger, () => this.isShuttingDown())

    this._namespaces.forEach((ns) => {
      server.of(ns).use(authMiddleware)
    })

    server.adapter(this.adapterConstructor)
    return server
  }
}
