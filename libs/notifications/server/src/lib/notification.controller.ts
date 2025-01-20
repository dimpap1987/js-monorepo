import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import {
  LoggedInGuard,
  RolesGuard,
  SessionUser,
} from '@js-monorepo/auth/nest/session'
import { ApiException } from '@js-monorepo/nest/exceptions'
import {
  CreatePushNotificationType,
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
import { NotificationService } from './notification.service'

@Controller('notifications')
@UseGuards(LoggedInGuard)
export class NotificationController {
  private logger = new Logger(NotificationController.name)
  constructor(private notificationService: NotificationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  async createNotification(@Body() payload: NotificationCreateDto) {
    //TODO Validate body
    try {
      const result = await this.notificationService.createNotification(payload)
      this.logger.log(
        `Notifications successfully created and sent to '${result.total}' users`
      )
    } catch (e: any) {
      this.logger.error(
        `Error while sending notification to user: ${payload?.receiverIds?.join(', ')}`,
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

  @Patch('read-all')
  @HttpCode(204)
  async markAllAsRead(@SessionUser() sessionUser: SessionUserType) {
    try {
      await this.notificationService.markAllAsRead(sessionUser.id)
    } catch (e: any) {
      this.logger.error(
        'Error while marking all notifications as read',
        e.stack
      )
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ERROR_READ_ALL_NOTIFICATIONS'
      )
    }
  }

  @Patch(':notificationId/archive')
  @HttpCode(204)
  async archiveNotification(@Param('notificationId') notificationId: number) {
    try {
      await this.notificationService.archiveNotification(notificationId)
    } catch (e: any) {
      this.logger.error('Error while set notification archieve', e.stack)
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ERROR_ARCHIVE_NOTIFICATIONS'
      )
    }
  }

  @Post('subscribe/:userId')
  @HttpCode(204)
  async subscribeUser(
    @Param('userId') userId: number,
    @Body() subscription: any
  ) {
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_INVALID_PAYLOAD')
    }
    await this.notificationService.saveUserSubscription(userId, subscription)
  }

  @Post('push-notification')
  @UseGuards(RolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  async sendPushNotification(
    @Body()
    payload: CreatePushNotificationType
  ) {
    //TODO Validate body
    try {
      await this.notificationService.sendPushNotification(payload.receiverIds, {
        title: payload.title,
        message: payload.message,
        data: {
          url: process.env['AUTH_LOGIN_REDIRECT'],
        },
      })
    } catch (e: any) {
      this.logger.error(
        `Error while sending push notification to users: ${payload?.receiverIds?.join(', ')}`,
        e.stack
      )
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        'ERROR_CREATE_PUSH_NOTIFICATION'
      )
    }
  }
}
