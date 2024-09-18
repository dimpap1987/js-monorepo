import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { RolesGuard } from '@js-monorepo/auth/nest/session'
import { AuthUserDto, AuthUserFullDto } from '@js-monorepo/types'
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { AuthUser } from '@prisma/client'
import { AdminService } from '../services/admin.service'

@Controller('admin')
@UseGuards(RolesGuard)
@HasRoles(RolesEnum.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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

  @Put('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUser: Omit<AuthUser, 'id' | 'email' | 'createdAt'>
  ): Promise<AuthUserDto> {
    return this.adminService.updateUser(userId, updateUser)
  }
}
