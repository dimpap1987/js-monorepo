import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { RolesGuard } from '@js-monorepo/auth/nest/session'
import { AuthUserDto, AuthUserFullDto } from '@js-monorepo/types'
import { OnlineUsersService } from '@js-monorepo/user-presence'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AuthUser } from '@prisma/client'
import { AdminService } from './admin.service'

@Controller('admin')
@UseGuards(RolesGuard)
@HasRoles(RolesEnum.ADMIN)
export class AdminController {
  private logger = new Logger(AdminController.name)

  constructor(
    private readonly adminService: AdminService,
    private readonly οnlineUsersService: OnlineUsersService
  ) {}

  @Get('users')
  async getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number
  ): Promise<{
    users: AuthUserFullDto[]
    totalCount: number
  }> {
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
}
