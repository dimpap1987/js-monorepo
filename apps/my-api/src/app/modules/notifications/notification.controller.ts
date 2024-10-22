import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import {
  NotificationCreateDto,
  PaginationType,
  SessionUserType,
  UserNotificationType,
} from '@js-monorepo/types'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiException } from '../../exceptions/api-exception'
import { NotificationService } from './notification.service'

@Controller('notifications')
@UseGuards(LoggedInGuard)
export class NotificationController {
  private logger = new Logger(NotificationController.name)
  constructor(private notificationService: NotificationService) {}

  @Post()
  async createNotification(@Body() payload: NotificationCreateDto) {
    //TODO Validate body
    try {
      return await this.notificationService.createNotification(payload)
    } catch (e: any) {
      this.logger.error(
        `Error while sending notification to user: ${payload?.receiverId}`,
        e.stack
      )
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ERROR_CREATE_NOTIFICATION'
      )
    }
  }

  @Get('users/:userId')
  async getNotifications(
    @SessionUser() sessionUser: SessionUserType,
    @Param('userId') userId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true }))
    pageSize = 10
  ): Promise<PaginationType<UserNotificationType> & { unReadTotal?: number }> {
    if (!sessionUser.isAdmin && userId !== sessionUser.id) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'ERROR_FORBIDDEN')
    }
    return this.notificationService.getNotifications(userId, {
      page,
      pageSize,
    })
  }

  @Patch(':notificationId/read')
  @HttpCode(204)
  async markAsRead(
    @Param('notificationId') notificationId: number,
    @SessionUser() sessionUser: SessionUserType
  ) {
    try {
      await this.notificationService.markAsRead(notificationId, sessionUser.id)
    } catch (e: any) {
      this.logger.error('Error while set notification read', e.stack)
    }
  }

  @Patch(':notificationId/archive')
  @HttpCode(204)
  async archiveNotification(@Param('notificationId') notificationId: number) {
    try {
      await this.notificationService.archiveNotification(notificationId)
    } catch (e: any) {
      this.logger.error('Error while set notification archieve', e.stack)
    }
  }
}
