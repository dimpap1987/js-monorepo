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
  UseGuards,
} from '@nestjs/common'
import { AppUserService } from '../app-users/app-user.service'
import { OrganizerService } from '../organizers/organizer.service'
import {
  InvitationResponseDto,
  PendingInvitationDto,
  RespondToInvitationDto,
  SendInvitationDto,
} from './dto/invitation.dto'
import { InvitationService } from './invitation.service'
import { LoggedInGuard, SessionUser } from '@js-monorepo/auth/nest/session'
import { SessionUserType } from '@js-monorepo/types/auth'

@Controller('scheduling/invitations')
@UseGuards(LoggedInGuard)
export class InvitationController {
  private readonly logger = new Logger(InvitationController.name)

  constructor(
    private readonly invitationService: InvitationService,
    private readonly appUserService: AppUserService,
    private readonly organizerService: OrganizerService
  ) {}

  /**
   * Helper to get AppUser ID from session (authUserId -> appUserId)
   */
  private async getAppUserId(sessionUser: SessionUserType): Promise<number> {
    const appUser = await this.appUserService.getOrCreateAppUser(sessionUser.id)
    return appUser.id
  }

  /**
   * Send an invitation to a user for a private class
   * POST /scheduling/invitations
   */
  @Post()
  async sendInvitation(
    @SessionUser() sessionUser: SessionUserType,
    @Body() dto: SendInvitationDto
  ): Promise<InvitationResponseDto> {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.invitationService.sendInvitation(organizerId, dto)
  }

  /**
   * Get all pending invitations for the current user
   * GET /scheduling/invitations/pending
   */
  @Get('pending')
  async getPendingInvitations(@SessionUser() sessionUser: SessionUserType): Promise<PendingInvitationDto[]> {
    const appUserId = await this.getAppUserId(sessionUser)
    return this.invitationService.getPendingInvitations(appUserId)
  }

  /**
   * Get all invitations sent by organizer (for dashboard)
   * GET /scheduling/invitations/sent
   */
  @Get('sent')
  async getSentInvitations(@SessionUser() sessionUser: SessionUserType): Promise<InvitationResponseDto[]> {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.invitationService.getInvitationsByOrganizer(organizerId)
  }

  /**
   * Get invitations for a specific class (organizer only)
   * GET /scheduling/invitations/class/:classId
   */
  @Get('class/:classId')
  async getInvitationsByClass(
    @SessionUser() sessionUser: SessionUserType,
    @Param('classId', ParseIntPipe) classId: number
  ): Promise<InvitationResponseDto[]> {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.invitationService.getInvitationsByClass(classId, organizerId)
  }

  /**
   * Respond to an invitation (accept/decline)
   * PATCH /scheduling/invitations/:invitationId/respond
   */
  @Patch(':invitationId/respond')
  async respondToInvitation(
    @SessionUser() sessionUser: SessionUserType,
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @Body() dto: RespondToInvitationDto
  ): Promise<InvitationResponseDto> {
    const appUserId = await this.getAppUserId(sessionUser)
    return this.invitationService.respondToInvitation(invitationId, appUserId, dto.status)
  }

  /**
   * Cancel/delete an invitation (organizer only)
   * DELETE /scheduling/invitations/:invitationId
   */
  @Delete(':invitationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelInvitation(
    @SessionUser() sessionUser: SessionUserType,
    @Param('invitationId', ParseIntPipe) invitationId: number
  ): Promise<void> {
    const organizerId = await this.getOrganizerId(sessionUser)
    return this.invitationService.cancelInvitation(invitationId, organizerId)
  }

  private async getOrganizerId(sessionUser: SessionUserType): Promise<number> {
    const appUser = await this.appUserService.getOrCreateAppUser(sessionUser.id)
    const organizer = await this.organizerService.getOrganizerByAppUserId(appUser.id)

    if (!organizer) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'ORGANIZER_PROFILE_REQUIRED')
    }

    return organizer.id
  }
}
