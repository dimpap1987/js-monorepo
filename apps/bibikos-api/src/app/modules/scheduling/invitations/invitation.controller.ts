import { ApiException } from '@js-monorepo/nest/exceptions'
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
} from '@nestjs/common'
import { AppUserContext, AppUserContextType } from '../../../../decorators/app-user.decorator'
import {
  InvitationResponseDto,
  PendingInvitationDto,
  RespondToInvitationDto,
  SendInvitationDto,
} from './dto/invitation.dto'
import { InvitationService } from './invitation.service'

@Controller('scheduling/invitations')
export class InvitationController {
  private readonly logger = new Logger(InvitationController.name)

  constructor(private readonly invitationService: InvitationService) {}

  /**
   * Send an invitation to a user for a private class
   * POST /scheduling/invitations
   */
  @Post()
  async sendInvitation(
    @AppUserContext() appUserContext: AppUserContextType,
    @Body() dto: SendInvitationDto
  ): Promise<InvitationResponseDto> {
    const organizerId = await this.getOrganizerId(appUserContext)
    return this.invitationService.sendInvitation(organizerId, dto)
  }

  /**
   * Get all pending invitations for the current user
   * GET /scheduling/invitations/pending
   */
  @Get('pending')
  async getPendingInvitations(@AppUserContext() appUserContext: AppUserContextType): Promise<PendingInvitationDto[]> {
    return this.invitationService.getPendingInvitations(appUserContext.appUserId)
  }

  /**
   * Get all invitations sent by organizer (for dashboard)
   * GET /scheduling/invitations/sent
   */
  @Get('sent')
  async getSentInvitations(@AppUserContext() appUserContext: AppUserContextType): Promise<InvitationResponseDto[]> {
    const organizerId = await this.getOrganizerId(appUserContext)
    return this.invitationService.getInvitationsByOrganizer(organizerId)
  }

  /**
   * Get invitations for a specific class (organizer only)
   * GET /scheduling/invitations/class/:classId
   */
  @Get('class/:classId')
  async getInvitationsByClass(
    @AppUserContext() appUserContext: AppUserContextType,
    @Param('classId', ParseIntPipe) classId: number
  ): Promise<InvitationResponseDto[]> {
    const organizerId = await this.getOrganizerId(appUserContext)
    return this.invitationService.getInvitationsByClass(classId, organizerId)
  }

  /**
   * Respond to an invitation (accept/decline)
   * PATCH /scheduling/invitations/:invitationId/respond
   */
  @Patch(':invitationId/respond')
  async respondToInvitation(
    @AppUserContext() appUserContext: AppUserContextType,
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @Body() dto: RespondToInvitationDto
  ): Promise<InvitationResponseDto> {
    return this.invitationService.respondToInvitation(invitationId, appUserContext.appUserId, dto.status)
  }

  /**
   * Cancel/delete an invitation (organizer only)
   * DELETE /scheduling/invitations/:invitationId
   */
  @Delete(':invitationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelInvitation(
    @AppUserContext() appUserContext: AppUserContextType,
    @Param('invitationId', ParseIntPipe) invitationId: number
  ): Promise<void> {
    const organizerId = await this.getOrganizerId(appUserContext)
    return this.invitationService.cancelInvitation(invitationId, organizerId)
  }

  private async getOrganizerId(appUserContext: AppUserContextType): Promise<number> {
    if (!appUserContext.organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'ORGANIZER_PROFILE_REQUIRED')
    }

    return appUserContext?.organizerId
  }
}
