import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { LoggedInGuard, RolesGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { ApiException } from '@js-monorepo/nest/exceptions'
import {
  CreatePushNotificationType,
  CursorPaginationType,
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
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NotificationService } from './notification.service'

@Controller('notifications')
@UseGuards(LoggedInGuard)
export class NotificationController {
  private logger = new Logger(NotificationController.name)
  constructor(
    private notificationService: NotificationService,
    private readonly configService: ConfigService
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  async createNotification(@Body() payload: NotificationCreateDto) {
    //TODO Validate body
    try {
      const result = await this.notificationService.createNotification(payload)
      this.logger.log(`Notifications successfully created and sent to '${result.total}' users`)
    } catch (e: any) {
      this.logger.error(`Error while sending notification to user: ${payload?.receiverIds?.join(', ')}`, e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CREATE_NOTIFICATION')
    }
  }

  @Get('users/:userId')
  async getNotifications(
    @SessionUser() sessionUser: SessionUserType,
    @Param('userId') userId: number,
    @Query('page') pageParam?: string,
    @Query('pageSize') pageSizeParam?: string,
    @Query('cursor') cursorParam?: string,
    @Query('limit') limitParam?: string
  ): Promise<
    | (PaginationType<UserNotificationType> & { unReadTotal?: number })
    | (CursorPaginationType<UserNotificationType> & { unReadTotal?: number })
  > {
    if (!sessionUser.isAdmin && userId !== sessionUser.id) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'ERROR_FORBIDDEN')
    }

    // Check if cursor-based pagination is requested
    const hasCursorParams = cursorParam !== undefined || limitParam !== undefined

    // If cursor params are provided, use cursor-based pagination
    if (hasCursorParams) {
      // Parse cursor - handle null, undefined, or numeric string
      let cursor: number | null | undefined = undefined
      if (cursorParam !== undefined && cursorParam !== null && cursorParam !== 'null' && cursorParam !== '') {
        const parsedCursor = parseInt(cursorParam, 10)
        if (!isNaN(parsedCursor)) {
          cursor = parsedCursor
        }
      } else if (cursorParam === 'null' || cursorParam === '') {
        cursor = null
      }

      // Parse limit - handle undefined or numeric string
      let limit: number | undefined = undefined
      if (limitParam !== undefined && limitParam !== null && limitParam !== '') {
        const parsedLimit = parseInt(limitParam, 10)
        if (!isNaN(parsedLimit)) {
          limit = parsedLimit
        }
      }

      // Use cursor-based pagination
      return this.notificationService.getNotificationsByCursor(userId, {
        cursor: cursor ?? null,
        limit: limit ?? 15,
      })
    }

    // Fallback to page-based pagination for backward compatibility (e.g., mobile navbar)
    const page = pageParam ? parseInt(pageParam, 10) : 1
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10

    return this.notificationService.getNotifications(userId, {
      page: isNaN(page) ? 1 : page,
      pageSize: isNaN(pageSize) ? 10 : pageSize,
    })
  }

  @Patch(':notificationId/read')
  @HttpCode(204)
  async markAsRead(@Param('notificationId') notificationId: number, @SessionUser() sessionUser: SessionUserType) {
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
      this.logger.error('Error while marking all notifications as read', e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_READ_ALL_NOTIFICATIONS')
    }
  }

  @Patch(':notificationId/archive')
  @HttpCode(204)
  async archiveNotification(@Param('notificationId') notificationId: number) {
    try {
      await this.notificationService.archiveNotification(notificationId)
    } catch (e: any) {
      this.logger.error('Error while set notification archieve', e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_ARCHIVE_NOTIFICATIONS')
    }
  }

  @Post('subscribe/:userId')
  @HttpCode(204)
  async subscribeUser(@Param('userId') userId: number, @Body() subscription: any) {
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
          url: this.configService.get('AUTH_LOGIN_REDIRECT'),
        },
      })
    } catch (e: any) {
      this.logger.error(`Error while sending push notification to users: ${payload?.receiverIds?.join(', ')}`, e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CREATE_PUSH_NOTIFICATION')
    }
  }
}
