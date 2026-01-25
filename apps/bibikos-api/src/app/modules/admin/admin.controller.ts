import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { AuthSessionUserCacheService, RolesGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { FeatureFlagsService } from '@js-monorepo/feature-flags-server'
import { QueryValidationPipe, ZodPipe } from '@js-monorepo/nest/pipes'
import { UpdateUserSchemaType } from '@js-monorepo/schemas'
import { AuthUserDto, AuthUserFullDto, SessionUserType } from '@js-monorepo/types/auth'
import { PaginationType } from '@js-monorepo/types/pagination'
import { Subscription } from '@js-monorepo/types/subscription'
import { OnlineUsersService } from '@js-monorepo/user-presence'
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import {
  CreateTagCategoryDto,
  CreateTagCategorySchema,
  CreateTagDto,
  CreateTagSchema,
  TagService,
  UpdateTagCategoryDto,
  UpdateTagCategorySchema,
  UpdateTagDto,
  UpdateTagSchema,
} from '../tags'
import { AdminPaymentsService } from './admin-payments.service'
import { AdminService } from './admin.service'
import { SubscriptionFiltersSchema, SubscriptionFiltersType } from './dto/subscription-filters.schema'

@UseGuards(RolesGuard)
@HasRoles(RolesEnum.ADMIN)
@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name)

  constructor(
    private readonly adminService: AdminService,
    private readonly οnlineUsersService: OnlineUsersService,
    private readonly adminPaymentsService: AdminPaymentsService,
    private readonly authSessionCacheService: AuthSessionUserCacheService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly tagService: TagService
  ) {}

  @Get('users')
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number
  ): Promise<PaginationType<AuthUserFullDto>> {
    return this.adminService.getUsers(page, pageSize)
  }

  @Get('roles')
  async getRoles() {
    return this.adminService.getRoles()
  }

  @Get('online-users')
  async getOnlineUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number
  ) {
    return this.οnlineUsersService.getList(page, pageSize)
  }

  @Get('subscriptions')
  async getAllSubscriptions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query(new QueryValidationPipe(SubscriptionFiltersSchema)) filters?: SubscriptionFiltersType
  ): Promise<PaginationType<Subscription>> {
    return this.adminPaymentsService.getAllSubscriptions(page, pageSize, filters)
  }

  @Get('subscriptions/stats')
  async getSubscriptionStats() {
    return this.adminPaymentsService.getSubscriptionStats()
  }

  // ===== Feature Flags Management =====

  @Get('feature-flags')
  async getFeatureFlags() {
    return this.featureFlagsService.getAllFlags()
  }

  @Post('feature-flags')
  async upsertFeatureFlag(
    @Body()
    body: {
      key: string
      enabled?: boolean
      rollout?: number
      description?: string
    }
  ) {
    await this.featureFlagsService.upsertFlag(body)
    return this.featureFlagsService.getAllFlags()
  }

  @Put('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUser: UpdateUserSchemaType
  ): Promise<AuthUserDto> {
    return this.adminService.updateUser(userId, updateUser)
  }

  @Post('users/:id/ban')
  @HttpCode(HttpStatus.OK)
  async banUser(@Param('id', ParseIntPipe) userId: number): Promise<AuthUserDto> {
    return this.adminService.banUser(userId)
  }

  @Post('users/:id/unban')
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param('id', ParseIntPipe) userId: number): Promise<AuthUserDto> {
    return this.adminService.unbanUser(userId)
  }

  @Post('users/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateUser(@Param('id', ParseIntPipe) userId: number): Promise<AuthUserDto> {
    return this.adminService.deactivateUser(userId)
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

  // ===== Tag Categories Management =====

  @Post('tag-categories')
  @HttpCode(HttpStatus.CREATED)
  async createTagCategory(@Body(new ZodPipe(CreateTagCategorySchema)) dto: CreateTagCategoryDto) {
    return this.tagService.createCategory(dto)
  }

  @Patch('tag-categories/:id')
  async updateTagCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(UpdateTagCategorySchema)) dto: UpdateTagCategoryDto
  ) {
    return this.tagService.updateCategory(id, dto)
  }

  @Delete('tag-categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTagCategory(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.deleteCategory(id)
  }

  // ===== Tags Management =====

  @Post('tags')
  @HttpCode(HttpStatus.CREATED)
  async createTag(@Body(new ZodPipe(CreateTagSchema)) dto: CreateTagDto) {
    return this.tagService.createTag(dto)
  }

  @Patch('tags/:id')
  async updateTag(@Param('id', ParseIntPipe) id: number, @Body(new ZodPipe(UpdateTagSchema)) dto: UpdateTagDto) {
    return this.tagService.updateTag(id, dto)
  }

  @Delete('tags/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.deleteTag(id)
  }
}
