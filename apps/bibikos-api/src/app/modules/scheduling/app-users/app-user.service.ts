import { ApiException } from '@js-monorepo/nest/exceptions'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { BibikosCacheService } from '../cache'
import { AppUserRepo, AppUserRepository, AppUserWithProfiles } from './app-user.repository'
import { AppUserResponseDto, UpdateAppUserDto } from './dto/app-user.dto'

@Injectable()
export class AppUserService {
  private readonly logger = new Logger(AppUserService.name)

  constructor(
    @Inject(AppUserRepo)
    private readonly appUserRepo: AppUserRepository,
    private readonly cacheService: BibikosCacheService
  ) {}

  @Transactional()
  async getOrCreateAppUserByAuthId(
    authUserId: number,
    defaults?: Partial<UpdateAppUserDto>
  ): Promise<AppUserResponseDto> {
    const appUser = await this.getAppUserByAuthId(authUserId)

    if (appUser) return appUser

    this.logger.log(`Creating AppUser for authUserId: ${authUserId}`)

    const created = await this.appUserRepo.create({
      authUser: { connect: { id: authUserId } },
      locale: defaults?.locale ?? 'en-US',
      timezone: defaults?.timezone ?? 'UTC',
      countryCode: defaults?.countryCode ?? null,
    })

    // New user won't have profiles yet
    const responseDto = this.toResponseDtoWithProfiles({
      ...created,
      organizerProfile: null,
      participantProfile: null,
    })

    return responseDto
  }

  async getAppUserByAuthId(authUserId: number): Promise<AppUserResponseDto | null> {
    return this.cacheService.getOrSetAppUser<AppUserResponseDto | null>(authUserId, async () => {
      const appUser = await this.appUserRepo.findByAuthUserIdWithProfiles(authUserId)
      if (!appUser) return null
      return this.toResponseDtoWithProfiles(appUser)
    })
  }

  async updateAppUser(authUserId: number, data: UpdateAppUserDto): Promise<AppUserResponseDto> {
    const appUser = await this.appUserRepo.findByAuthUserIdWithProfiles(authUserId)

    if (!appUser) throw new ApiException(HttpStatus.NOT_FOUND, 'APP_USER_NOT_FOUND')

    const updated = await this.appUserRepo.update(appUser.id, {
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.locale !== undefined && { locale: data.locale }),
      ...(data.timezone !== undefined && { timezone: data.timezone }),
      ...(data.countryCode !== undefined && { countryCode: data.countryCode }),
    })

    // Invalidate cache after update
    await this.cacheService.invalidateAppUser(authUserId)

    this.logger.log(`Updated AppUser ${updated.id} for authUserId: ${authUserId}`)

    const responseDto = this.toResponseDtoWithProfiles({
      ...updated,
      organizerProfile: appUser.organizerProfile,
      participantProfile: appUser.participantProfile,
    })
    return responseDto
  }

  private toResponseDtoWithProfiles(appUser: AppUserWithProfiles): AppUserResponseDto {
    return {
      id: appUser.id,
      authUserId: appUser.authUserId,
      locale: appUser.locale,
      timezone: appUser.timezone,
      // countryCode: appUser.countryCode,
      createdAt: appUser.createdAt,
      hasOrganizerProfile: !!appUser.organizerProfile,
      hasParticipantProfile: !!appUser.participantProfile,
    }
  }
}
