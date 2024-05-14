import { HasRoles, RolesEnum, RolesGuard } from '@js-monorepo/auth'
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
import { AuthUserFullPayload } from '@js-monorepo/types'

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
    users: AuthUserFullPayload[]
    totalCount: number
  }> {
    return this.adminService.getUsers(page, pageSize)
  }

  @Put('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUser: Omit<AuthUser, 'id' | 'email' | 'createdAt'>
  ): Promise<AuthUser> {
    return this.adminService.updateUser(userId, updateUser)
  }
}
