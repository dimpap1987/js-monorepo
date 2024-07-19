import { HasRoles, RolesEnum, RolesGuard } from '@js-monorepo/auth'
import { AuthUserDto, AuthUserFullDto } from '@js-monorepo/types'
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { AuthUser } from '@prisma/client'
import { AdminService } from '../services/admin.service'
import { EventsService } from '../services/event.service'

@Controller('admin')
@UseGuards(RolesGuard)
@HasRoles(RolesEnum.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private eventsService: EventsService
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

  @Put('users/:id')
  async updateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateUser: Omit<AuthUser, 'id' | 'email' | 'createdAt'>
  ): Promise<AuthUserDto> {
    return this.adminService.updateUser(userId, updateUser)
  }

  @Post('notification/emit')
  async emit(@Req() req: any) {
    const { channel, message } = req.body
    this.eventsService.emit(channel, {
      id: Math.random() * 1000,
      message: message,
      time: new Date(),
    })
    return { ok: true }
  }
}
