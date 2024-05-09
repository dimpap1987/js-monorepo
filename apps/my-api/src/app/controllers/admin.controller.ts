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
import { UserService } from '../services/user.service'

@Controller('admin')
@UseGuards(RolesGuard)
@HasRoles(RolesEnum.ADMIN)
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  async getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number
  ): Promise<AuthUser[]> {
    return this.userService.getUsers(page, pageSize)
  }

  @Put('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUser: Omit<AuthUser, 'id' | 'email' | 'createdAt'>
  ): Promise<AuthUser> {
    return this.userService.updateUser(userId, updateUser)
  }
}
