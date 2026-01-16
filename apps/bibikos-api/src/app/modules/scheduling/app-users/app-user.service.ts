import { ApiException } from '@js-monorepo/nest/exceptions'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { AppUserRepo, AppUserRepository, AppUserWithProfiles } from './app-user.repository'
import { AppUserResponseDto, UpdateAppUserDto } from './dto/app-user.dto'

@Injectable()
export class AppUserService {
  private readonly logger = new Logger(AppUserService.name)

  constructor(
    @Inject(AppUserRepo)
    private readonly appUserRepo: AppUserRepository
  ) {}

  /**
   * Get or create an AppUser for the given auth user (includes profile flags)
   * This is called automatically when a user accesses scheduling features
   */
  @Transactional()
  async getOrCreateAppUser(authUserId: number, defaults?: Partial<UpdateAppUserDto>): Promise<AppUserResponseDto> {
    let appUser = await this.appUserRepo.findByAuthUserIdWithProfiles(authUserId)

    if (!appUser) {
      this.logger.log(`Creating AppUser for authUserId: ${authUserId}`)
      const created = await this.appUserRepo.create({
        authUser: { connect: { id: authUserId } },
        fullName: defaults?.fullName ?? null,
        locale: defaults?.locale ?? 'en-US',
        timezone: defaults?.timezone ?? 'UTC',
        countryCode: defaults?.countryCode ?? null,
      })
      // New user won't have profiles yet
      appUser = {
        ...created,
        organizerProfile: null,
        participantProfile: null,
      }
    }

    return this.toResponseDtoWithProfiles(appUser)
  }

  /**
   * Get AppUser by auth user ID (includes profile flags)
   */
  async getAppUser(authUserId: number): Promise<AppUserResponseDto | null> {
    const appUser = await this.appUserRepo.findByAuthUserIdWithProfiles(authUserId)
    return appUser ? this.toResponseDtoWithProfiles(appUser) : null
  }

  /**
   * Update AppUser preferences
   */
  @Transactional()
  async updateAppUser(authUserId: number, data: UpdateAppUserDto): Promise<AppUserResponseDto> {
    const appUser = await this.appUserRepo.findByAuthUserIdWithProfiles(authUserId)

    if (!appUser) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'APP_USER_NOT_FOUND')
    }

    const updated = await this.appUserRepo.update(appUser.id, {
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.locale !== undefined && { locale: data.locale }),
      ...(data.timezone !== undefined && { timezone: data.timezone }),
      ...(data.countryCode !== undefined && { countryCode: data.countryCode }),
    })

    this.logger.log(`Updated AppUser ${updated.id} for authUserId: ${authUserId}`)
    // Return with current profile status
    return this.toResponseDtoWithProfiles({
      ...updated,
      organizerProfile: appUser.organizerProfile,
      participantProfile: appUser.participantProfile,
    })
  }

  private toResponseDtoWithProfiles(appUser: AppUserWithProfiles): AppUserResponseDto {
    return {
      id: appUser.id,
      fullName: appUser.fullName,
      locale: appUser.locale,
      timezone: appUser.timezone,
      countryCode: appUser.countryCode,
      createdAt: appUser.createdAt,
      hasOrganizerProfile: !!appUser.organizerProfile,
      hasParticipantProfile: !!appUser.participantProfile,
    }
  }
}
