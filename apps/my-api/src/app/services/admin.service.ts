import { AuthException } from '@js-monorepo/auth/nest/common/exceptions/api-exception'
import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { UserUpdateUserSchema } from '@js-monorepo/schemas'
import { AuthUserDto, AuthUserFullDto } from '@js-monorepo/types'
import { UserPresenceWebsocketService } from '@js-monorepo/user-presence'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { AuthUser } from '@prisma/client'
import { ApiException } from '../exceptions/api-exception'
import { AdminRepository } from '../repositories/interfaces/admin.repository'
import { AdminRepo } from '../types'

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(
    @Inject(AdminRepo)
    private readonly adminRepository: AdminRepository,
    private readonly authSessionUserCacheService: AuthSessionUserCacheService,
    private readonly userPresenceWebsocketService: UserPresenceWebsocketService
  ) {}

  async getUsers(
    page?: number,
    pageSize?: number
  ): Promise<{
    users: AuthUserFullDto[]
    totalCount: number
  }> {
    this.logger.debug(
      `Fetching user: page: '${page}' - pageSize: '${pageSize}'`
    )
    try {
      return await this.adminRepository.getUsers({
        page,
        pageSize,
      })
    } catch (e) {
      this.logger.error(
        `Error fetching user: page: '${page}' - pageSize: '${pageSize}'`,
        e.stack
      )
    }
    return {
      users: [],
      totalCount: 0,
    }
  }

  async updateUser(
    userId: number,
    updateUser: Omit<AuthUser, 'id' | 'email' | 'createdAt'>
  ): Promise<AuthUserDto> {
    this.logger.debug(`Updating User with id: '${userId}'`)
    UserUpdateUserSchema.parse(updateUser)
    try {
      return await this.adminRepository.updateUser(userId, updateUser)
    } catch (e) {
      this.logger.error(`Error Updating User with id: '${userId}'`, e.stack)
      throw new ApiException()
    }
  }

  getRoles() {
    return this.adminRepository.getRoles()
  }

  async handleUserDisconnection(userId: number) {
    try {
      await this.authSessionUserCacheService.deleteAuthUserSessions(userId)
      await this.userPresenceWebsocketService.disconnectUser(userId)
    } catch (e: any) {
      this.logger.error(
        `Error while handling user disconnection with user id : ${userId}`
      )
      if (e instanceof AuthException) {
        return e
      }
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_DISCONNECTING_USER')
    }
  }
}
