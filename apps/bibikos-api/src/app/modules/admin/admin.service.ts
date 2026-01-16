import { AuthException } from '@js-monorepo/auth/nest/common/exceptions/api-exception'
import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { UpdateUserSchemaType, UserUpdateUserSchema } from '@js-monorepo/schemas'
import { AuthUserDto, AuthUserFullDto, UserStatus } from '@js-monorepo/types/auth'
import { PaginationType } from '@js-monorepo/types/pagination'
import { Events, Rooms, UserPresenceWebsocketService } from '@js-monorepo/user-presence'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { HttpStatus, Inject, Injectable, Logger, UseInterceptors } from '@nestjs/common'
import { AdminRepo, AdminRepository } from './admin.repository'

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(
    @Inject(AdminRepo)
    private readonly adminRepository: AdminRepository,
    private readonly authSessionUserCacheService: AuthSessionUserCacheService,
    private readonly userPresenceWebsocketService: UserPresenceWebsocketService
  ) {}

  async getUsers(page?: number, pageSize?: number): Promise<PaginationType<AuthUserFullDto>> {
    this.logger.debug(`Fetching user: page: '${page}' - pageSize: '${pageSize}'`)
    try {
      return await this.adminRepository.getUsers({
        page: page ?? 1,
        pageSize: pageSize ?? 10,
      })
    } catch (e) {
      this.logger.error(`Error fetching user: page: '${page}' - pageSize: '${pageSize}'`, e.stack)
    }
    throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_FETCHING_USERS')
  }

  async updateUser(userId: number, updateUser: UpdateUserSchemaType): Promise<AuthUserDto> {
    this.logger.debug(`Updating User with id: '${userId}'`)
    UserUpdateUserSchema.parse(updateUser)
    try {
      const updatedUser = await this.adminRepository.updateUser(userId, updateUser)
      await this.authSessionUserCacheService.invalidateAuthUserInCache(userId)

      const isAdmin = updatedUser.userRole.some((role) => role.role.name === 'ADMIN')

      if (!isAdmin) {
        this.userPresenceWebsocketService.removeUserFromRooms(updatedUser.id, [Rooms.admin])
      }

      this.userPresenceWebsocketService.sendToUsers([userId], Events.refreshSession, true)
      return updatedUser
    } catch (e) {
      this.logger.error(`Error Updating User with id: '${userId}'`, e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_UPDATING_USERS')
    }
  }

  @CacheKey('admin-service:user_roles')
  @CacheTTL(10 * 60 * 1000) // Cache for 10 minutes (600,000 milliseconds)
  @UseInterceptors(CacheInterceptor)
  getRoles() {
    return this.adminRepository.getRoles()
  }

  async handleUserDisconnection(userId: number) {
    try {
      this.userPresenceWebsocketService.sendToUsers([userId], Events.refreshSession, true)
      await this.authSessionUserCacheService.deleteAuthUserSessions(userId)
      await this.userPresenceWebsocketService.disconnectUser(userId)
    } catch (e: any) {
      this.logger.error(`Error while handling user disconnection with user id : ${userId}`, e.stack)
      if (e instanceof AuthException) {
        return e
      }
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_DISCONNECTING_USER')
    }
  }

  async banUser(userId: number): Promise<AuthUserDto> {
    this.logger.debug(`Banning user with id: '${userId}'`)
    try {
      const bannedUser = await this.adminRepository.banUser(userId)
      // Invalidate cache and disconnect user sessions
      await this.authSessionUserCacheService.invalidateAuthUserInCache(userId)
      await this.authSessionUserCacheService.deleteAuthUserSessions(userId)
      await this.userPresenceWebsocketService.disconnectUser(userId)
      this.logger.warn(`User ${userId} has been banned`)
      return bannedUser
    } catch (e) {
      this.logger.error(`Error banning user with id: '${userId}'`, e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_BANNING_USER')
    }
  }

  async unbanUser(userId: number): Promise<AuthUserDto> {
    this.logger.debug(`Unbanning user with id: '${userId}'`)
    try {
      const unbannedUser = await this.adminRepository.unbanUser(userId)
      // Invalidate cache to ensure fresh data is fetched on next login
      await this.authSessionUserCacheService.invalidateAuthUserInCache(userId)
      // Delete existing sessions to force re-login with fresh user data
      await this.authSessionUserCacheService.deleteAuthUserSessions(userId)
      this.logger.warn(`User ${userId} has been unbanned`)
      return unbannedUser
    } catch (e) {
      this.logger.error(`Error unbanning user with id: '${userId}'`, e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_UNBANNING_USER')
    }
  }

  async deactivateUser(userId: number): Promise<AuthUserDto> {
    this.logger.debug(`Deactivating user with id: '${userId}'`)
    try {
      const deactivatedUser = await this.adminRepository.deactivateUser(userId)
      // Invalidate cache and disconnect user sessions
      await this.authSessionUserCacheService.invalidateAuthUserInCache(userId)
      await this.authSessionUserCacheService.deleteAuthUserSessions(userId)
      await this.userPresenceWebsocketService.disconnectUser(userId)
      this.logger.warn(`User ${userId} has been deactivated`)
      return deactivatedUser
    } catch (e) {
      this.logger.error(`Error deactivating user with id: '${userId}'`, e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_DEACTIVATING_USER')
    }
  }
}
