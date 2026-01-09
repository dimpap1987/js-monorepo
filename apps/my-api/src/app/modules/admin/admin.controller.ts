import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { AuthSessionUserCacheService, RolesGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { AuthUserDto, AuthUserFullDto, SessionUserType } from '@js-monorepo/types/auth'
import { PaginationType } from '@js-monorepo/types/pagination'
import { Subscription } from '@js-monorepo/types/subscription'
import { OnlineUsersService } from '@js-monorepo/user-presence'
import { CacheInterceptor } from '@nestjs/cache-manager'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { AuthUser } from '@js-monorepo/db'
import { Request } from 'express'
import { AdminPaymentsService } from './admin-payments.service'
import { AdminService } from './admin.service'

@Controller('admin')
@UseGuards(RolesGuard)
@HasRoles(RolesEnum.ADMIN)
export class AdminController {
  private readonly logger = new Logger(AdminController.name)

  constructor(
    private readonly adminService: AdminService,
    private readonly οnlineUsersService: OnlineUsersService,
    private readonly adminPaymentsService: AdminPaymentsService,
    private readonly authSessionCacheService: AuthSessionUserCacheService
  ) {}

  @Get('users')
  @UseInterceptors(CacheInterceptor)
  async getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number
  ): Promise<PaginationType<AuthUserFullDto>> {
    return this.adminService.getUsers(page, pageSize)
  }

  @Get('roles')
  async getRoles() {
    return this.adminService.getRoles()
  }

  @Get('online-users')
  async getOnlineUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number
  ) {
    return this.οnlineUsersService.getList(page, pageSize)
  }

  @Get('subscriptions')
  async getAllSubscriptions(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('plan') plan?: string
  ): Promise<PaginationType<Subscription>> {
    const filters = { status, search, plan }
    return this.adminPaymentsService.getAllSubscriptions(page, pageSize, filters)
  }

  @Get('subscriptions/stats')
  async getSubscriptionStats() {
    return this.adminPaymentsService.getSubscriptionStats()
  }

  @Put('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUser: Omit<AuthUser, 'id' | 'email' | 'createdAt'>
  ): Promise<AuthUserDto> {
    return this.adminService.updateUser(userId, updateUser)
  }

  @Delete('users-session/:id')
  @HttpCode(204)
  async deleteUserSession(@Param('id', ParseIntPipe) userId: number) {
    return this.adminService.handleUserDisconnection(userId)
  }

  @Post('impersonate/:id')
  @HttpCode(HttpStatus.OK)
  async impersonateUser(
    @Param('id', ParseIntPipe) targetUserId: number,
    @SessionUser() currentUser: SessionUserType,
    @Req() req: Request
  ) {
    // Prevent self-impersonation
    if (targetUserId === currentUser.id) {
      return { success: false, message: 'Cannot impersonate yourself' }
    }

    // Get the target user's session data
    const targetUser = await this.authSessionCacheService.findOrSaveAuthUserById(targetUserId)

    if (!targetUser) {
      return { success: false, message: 'User not found' }
    }

    // Prevent impersonating other admins
    const isTargetAdmin = targetUser.roles?.includes(RolesEnum.ADMIN)
    if (isTargetAdmin) {
      return { success: false, message: 'Cannot impersonate another admin' }
    }

    const originalAdminId = currentUser.id

    // Login as the target user first
    await new Promise<void>((resolve, reject) => {
      req.logIn({ user: targetUser }, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    // Store original admin info AFTER login (session may have been modified by logIn)
    const session = req.session as unknown as Record<string, unknown>
    session.impersonatingFrom = originalAdminId

    // Explicitly save the session
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    this.logger.warn(
      `[IMPERSONATION_START] Admin userId=${originalAdminId} started impersonating userId=${targetUserId} (${targetUser.username})`
    )

    return { success: true, user: targetUser }
  }
}
