import { ApiException } from '@js-monorepo/nest/exceptions'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { AppUserRepo, AppUserRepository } from '../app-users/app-user.repository'
import { ParticipantResponseDto } from './dto/participant.dto'
import { ParticipantRepo, ParticipantRepository } from './participant.repository'

@Injectable()
export class ParticipantService {
  private readonly logger = new Logger(ParticipantService.name)

  constructor(
    @Inject(ParticipantRepo)
    private readonly participantRepo: ParticipantRepository,
    @Inject(AppUserRepo)
    private readonly appUserRepo: AppUserRepository
  ) {}

  /**
   * Get participant profile by app user ID
   */
  async getParticipantByAppUserId(appUserId: number): Promise<ParticipantResponseDto | null> {
    const participant = await this.participantRepo.findByAppUserId(appUserId)
    return participant ? this.toResponseDto(participant) : null
  }

  /**
   * Get participant profile by ID
   */
  async getParticipantById(participantId: number): Promise<ParticipantResponseDto | null> {
    const participant = await this.participantRepo.findById(participantId)
    return participant ? this.toResponseDto(participant) : null
  }

  /**
   * Get or create participant profile for an app user
   * A user automatically becomes a participant when they book a class
   */
  @Transactional()
  async getOrCreateParticipant(appUserId: number): Promise<ParticipantResponseDto> {
    // Check if already a participant
    const existing = await this.participantRepo.findByAppUserId(appUserId)
    if (existing) {
      return this.toResponseDto(existing)
    }

    // Verify app user exists
    const appUser = await this.appUserRepo.findById(appUserId)
    if (!appUser) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'APP_USER_NOT_FOUND')
    }

    const participant = await this.participantRepo.create({
      appUser: { connect: { id: appUserId } },
    })

    this.logger.log(`Created participant profile ${participant.id} for appUser ${appUserId}`)
    return this.toResponseDto(participant)
  }

  private toResponseDto(participant: {
    id: number
    appUserId: number
    createdAt: Date
  }): ParticipantResponseDto {
    return {
      id: participant.id,
      appUserId: participant.appUserId,
      createdAt: participant.createdAt,
    }
  }
}
