import { HasRoles } from '@js-monorepo/auth/nest/common'
import { RolesEnum } from '@js-monorepo/auth/nest/common/types'
import { LoggedInGuard, RolesGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { ZodPipe } from '@js-monorepo/nest/pipes'
import { ContactMessageSchema, ContactMessageUpdateStatusSchema } from '@js-monorepo/schemas'
import { ContactMessageCreateDto, ContactMessageUpdateStatusDto, ContactStatus } from '@js-monorepo/types/contact'
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
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ContactService } from './contact.service'
import { SessionUserType } from '@js-monorepo/types/auth'

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name)

  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(204)
  async create(
    @Body(new ZodPipe(ContactMessageSchema)) payload: ContactMessageCreateDto,
    @SessionUser() sessionUser?: SessionUserType
  ) {
    try {
      // For anonymous users, email is required
      if (!sessionUser && !payload.email) {
        throw new ApiException(HttpStatus.BAD_REQUEST, 'EMAIL_REQUIRED')
      }

      const message = await this.contactService.create(payload, sessionUser?.id)
      this.logger.log(`Contact message created from: ${message.email}`)
    } catch (e: any) {
      if (e instanceof ApiException) throw e
      this.logger.error(`Error creating contact message: ${e.message}`, e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_CREATE_CONTACT_MESSAGE')
    }
  }

  @Get()
  @UseGuards(RolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  async findAll(
    @Query('page') pageParam?: string,
    @Query('pageSize') pageSizeParam?: string,
    @Query('status') status?: ContactStatus
  ) {
    const page = pageParam ? parseInt(pageParam, 10) : 1
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10

    return this.contactService.findAll(
      {
        page: isNaN(page) ? 1 : page,
        pageSize: isNaN(pageSize) ? 10 : pageSize,
      },
      status
    )
  }

  @Get('unread-count')
  @UseGuards(RolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  async getUnreadCount() {
    const count = await this.contactService.countUnread()
    return { count }
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const message = await this.contactService.findById(id)
    if (!message) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'CONTACT_MESSAGE_NOT_FOUND')
    }
    return message
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodPipe(ContactMessageUpdateStatusSchema)) payload: ContactMessageUpdateStatusDto
  ) {
    try {
      const message = await this.contactService.updateStatus(id, payload.status)
      this.logger.log(`Contact message ${id} status updated to: ${payload.status}`)
      return message
    } catch (e: any) {
      this.logger.error(`Error updating contact message status: ${e.message}`, e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_UPDATE_CONTACT_MESSAGE')
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @HasRoles(RolesEnum.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.contactService.delete(id)
      this.logger.log(`Contact message ${id} deleted`)
    } catch (e: any) {
      this.logger.error(`Error deleting contact message: ${e.message}`, e.stack)
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_DELETE_CONTACT_MESSAGE')
    }
  }
}
