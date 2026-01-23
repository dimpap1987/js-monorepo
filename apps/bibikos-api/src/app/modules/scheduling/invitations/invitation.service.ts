import { InvitationStatus } from '@js-monorepo/bibikos-db'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { NotificationService } from '@js-monorepo/notifications-server'
import { Events, UserPresenceWebsocketService } from '@js-monorepo/user-presence'
import { Transactional } from '@nestjs-cls/transactional'
import { forwardRef, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { AppUserService } from '../app-users'
import { ClassService } from '../classes'
import { OrganizerService } from '../organizers'
import { InvitationResponseDto, PendingInvitationDto, SendInvitationDto } from './dto/invitation.dto'
import { InvitationRepo, InvitationRepository, InvitationWithDetails } from './invitation.repository'

@Injectable()
export class InvitationService {
  private readonly logger = new Logger(InvitationService.name)

  constructor(
    @Inject(InvitationRepo)
    private readonly invitationRepo: InvitationRepository,
    @Inject(forwardRef(() => ClassService))
    private readonly classService: ClassService,
    private readonly organizerService: OrganizerService,
    private readonly notificationService: NotificationService,
    private readonly wsService: UserPresenceWebsocketService,
    private readonly userService: AppUserService
  ) {}

  /**
   * Send an invitation to a user for a private class
   */
  @Transactional()
  async sendInvitation(organizerId: number, dto: SendInvitationDto): Promise<InvitationResponseDto> {
    // Validate class exists and belongs to organizer
    const classEntity = await this.classService.findById(dto.classId)
    if (!classEntity) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'CLASS_NOT_FOUND')
    }
    if (classEntity.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'CLASS_ACCESS_DENIED')
    }
    if (!classEntity.isPrivate) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'CLASS_NOT_PRIVATE')
    }

    // Get organizer details for the notification
    const organizer = await this.organizerService.findById(organizerId)
    if (!organizer) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ORGANIZER_NOT_FOUND')
    }

    // Try to resolve the user
    let invitedUser: {
      id: number
      authUserId: number
      authUser: { id: number; email: string; username: string }
    } | null = null

    if (dto.username) {
      // Find user by username (username is already case-insensitive via Citext)
      invitedUser = await this.userService.findByAuthUsername(dto.username)
    } else if (dto.email) {
      // Find user by email (case-insensitive search)
      invitedUser = await this.userService.findByAuthEmail(dto.email)
    }

    this.logger.log(
      `User lookup result for ${dto.email || dto.username}: ${invitedUser ? `Found appUser.id=${invitedUser.id}, authUserId=${invitedUser.authUserId}` : 'Not found'}`
    )

    // Check for existing invitation
    if (invitedUser) {
      const existingInvitation = await this.invitationRepo.findByClassAndUser(dto.classId, invitedUser.id)
      if (existingInvitation) {
        throw new ApiException(HttpStatus.CONFLICT, 'INVITATION_ALREADY_EXISTS')
      }
    } else if (dto.email) {
      const existingInvitation = await this.invitationRepo.findByClassAndEmail(dto.classId, dto.email)
      if (existingInvitation) {
        throw new ApiException(HttpStatus.CONFLICT, 'INVITATION_ALREADY_EXISTS')
      }
    } else if (dto.username) {
      const existingInvitation = await this.invitationRepo.findByClassAndUsername(dto.classId, dto.username)
      if (existingInvitation) {
        throw new ApiException(HttpStatus.CONFLICT, 'INVITATION_ALREADY_EXISTS')
      }
    }

    // Create the invitation
    const invitation = await this.invitationRepo.create({
      class: { connect: { id: dto.classId } },
      organizer: { connect: { id: organizerId } },
      ...(invitedUser && { invitedUser: { connect: { id: invitedUser.id } } }),
      invitedUsername: dto.username ?? null,
      invitedEmail: dto.email ?? null,
      message: dto.message ?? null,
      status: InvitationStatus.PENDING,
    })

    this.logger.log(
      `Created invitation ${invitation.id} for class ${dto.classId}, invitedUserId=${invitation.invitedUserId}`
    )

    // Send notification if user exists
    if (invitedUser) {
      this.logger.log(`Sending notification to authUserId=${invitedUser.authUserId}`)
      await this.sendInvitationNotification(invitedUser.authUserId, classEntity.title, organizer.displayName)
    }

    // Fetch with details for response
    const invitationWithDetails = await this.invitationRepo.findById(invitation.id)
    return this.toResponseDto(invitationWithDetails)
  }

  /**
   * Get all pending invitations for a user
   * @param appUserId - The AppUser ID (not authUserId)
   */
  async getPendingInvitations(appUserId: number): Promise<PendingInvitationDto[]> {
    this.logger.log(`Getting pending invitations for appUserId=${appUserId}`)

    const invitations = await this.invitationRepo.findPendingByUserId(appUserId)
    this.logger.log(`Found ${invitations.length} pending invitations for appUserId=${appUserId}`)

    return invitations.map(this.toPendingDto)
  }

  /**
   * Respond to an invitation (accept/decline)
   * @param invitationId - The invitation ID
   * @param appUserId - The AppUser ID (not authUserId)
   * @param status - ACCEPTED or DECLINED
   */
  @Transactional()
  async respondToInvitation(
    invitationId: number,
    appUserId: number,
    status: 'ACCEPTED' | 'DECLINED'
  ): Promise<InvitationResponseDto> {
    const invitation = await this.invitationRepo.findById(invitationId)
    if (!invitation) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'INVITATION_NOT_FOUND')
    }

    // Verify the invitation belongs to this user
    if (invitation.invitedUserId !== appUserId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'INVITATION_ACCESS_DENIED')
    }

    // Check if already responded
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'INVITATION_ALREADY_RESPONDED')
    }

    // Update status
    const newStatus = status === 'ACCEPTED' ? InvitationStatus.ACCEPTED : InvitationStatus.DECLINED
    await this.invitationRepo.updateStatus(invitationId, newStatus)

    this.logger.log(`AppUser ${appUserId} ${status.toLowerCase()} invitation ${invitationId}`)

    // Fetch updated invitation
    const updated = await this.invitationRepo.findById(invitationId)
    if (!updated) {
      throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, 'INVITATION_UPDATE_FAILED')
    }
    return this.toResponseDto(updated)
  }

  /**
   * Get invitations for a class (organizer view)
   */
  async getInvitationsByClass(classId: number, organizerId: number): Promise<InvitationResponseDto[]> {
    const classEntity = await this.classService.findById(classId)
    if (!classEntity) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'CLASS_NOT_FOUND')
    }
    if (classEntity.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'CLASS_ACCESS_DENIED')
    }

    const invitations = await this.invitationRepo.findByClassId(classId)
    return invitations.map(this.toResponseDto)
  }

  /**
   * Get all invitations sent by organizer (for dashboard)
   */
  async getInvitationsByOrganizer(organizerId: number): Promise<InvitationResponseDto[]> {
    const invitations = await this.invitationRepo.findByOrganizerId(organizerId)
    return invitations.map(this.toResponseDto)
  }

  /**
   * Cancel/delete an invitation
   */
  @Transactional()
  async cancelInvitation(invitationId: number, organizerId: number): Promise<void> {
    const invitation = await this.invitationRepo.findById(invitationId)
    if (!invitation) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'INVITATION_NOT_FOUND')
    }
    if (invitation.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'INVITATION_ACCESS_DENIED')
    }

    await this.invitationRepo.delete(invitationId)
    this.logger.log(`Deleted invitation ${invitationId}`)
  }

  async hasAcceptedInvitation(classId: number, userId: number) {
    return this.invitationRepo.hasAcceptedInvitation(classId, userId)
  }

  /**
   * Send notification to user about new invitation
   */
  private async sendInvitationNotification(
    authUserId: number,
    className: string,
    organizerName: string | null
  ): Promise<void> {
    const message = `You've been invited to join "${className}"${organizerName ? ` by ${organizerName}` : ''}`

    try {
      // Create notification in database and send web push
      await this.notificationService.createNotification({
        receiverIds: [authUserId],
        message,
        link: '/my-invitations',
        additionalData: { type: 'class_invitation' },
      })

      // Send real-time WebSocket notification
      await this.wsService.sendToUsers([authUserId], Events.classInvitation, {
        type: 'NEW_INVITATION',
        message,
        className,
        organizerName,
      })

      this.logger.log(`Sent invitation notification to user ${authUserId}`)
    } catch (error) {
      this.logger.error(`Failed to send invitation notification: ${error.message}`)
    }
  }

  private toResponseDto(invitation: InvitationWithDetails): InvitationResponseDto {
    return {
      id: invitation.id,
      classId: invitation.classId,
      className: invitation.class.title,
      organizerId: invitation.organizerId,
      organizerName: invitation.organizer.displayName,
      invitedUserId: invitation.invitedUserId,
      invitedUsername: invitation.invitedUsername ?? invitation.invitedUser?.authUser.username ?? null,
      invitedEmail: invitation.invitedEmail ?? invitation.invitedUser?.authUser.email ?? null,
      status: invitation.status,
      message: invitation.message,
      createdAt: invitation.createdAt,
      respondedAt: invitation.respondedAt,
      expiresAt: invitation.expiresAt,
    }
  }

  private toPendingDto(invitation: InvitationWithDetails): PendingInvitationDto {
    return {
      id: invitation.id,
      classId: invitation.classId,
      className: invitation.class.title,
      classDescription: invitation.class.description,
      organizerName: invitation.organizer.displayName,
      organizerSlug: invitation.organizer.slug,
      message: invitation.message,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    }
  }
}
