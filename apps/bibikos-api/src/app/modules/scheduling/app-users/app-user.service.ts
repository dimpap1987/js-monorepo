import { Transactional } from '@nestjs-cls/transactional'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { AppUserRepo, AppUserRepository, AppUserWithProfiles } from './app-user.repository'
import { AppUserResponseDto, UpdateAppUserDto } from './dto/app-user.dto'

@Injectable()
export class AppUserService {
  private readonly logger = new Logger(AppUserService.name)

  constructor(
    @Inject(AppUserRepo)
    private readonly appUserRepo: AppUserRepository
  ) {}

  @Transactional()
  async getOrCreateAppUserByAuthId(
    authUserId: number,
    defaults?: Partial<UpdateAppUserDto>
  ): Promise<AppUserResponseDto> {
    const appUser = await this.findByAuthId(authUserId)

    if (appUser) return appUser

    this.logger.log(`Creating AppUser for authUserId: ${authUserId}`)

    const created = await this.appUserRepo.create({
      authUser: { connect: { id: authUserId } },
      locale: defaults?.locale ?? 'en-US',
      timezone: defaults?.timezone ?? 'UTC',
      countryCode: defaults?.countryCode ?? null,
    })

    // New user won't have profiles yet
    return this.toResponseDtoWithProfiles({
      ...created,
      organizerProfile: null,
      participantProfile: null,
    })
  }

  async findByAuthId(authUserId: number): Promise<AppUserResponseDto | null> {
    const appUser = await this.appUserRepo.findByAuthIdWithProfiles(authUserId)
    return this.toResponseDtoWithProfiles(appUser)
  }

  async updateAppUser(authUserId: number, data: UpdateAppUserDto): Promise<void> {
    const updated = await this.appUserRepo.update(authUserId, {
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.locale !== undefined && { locale: data.locale }),
      ...(data.timezone !== undefined && { timezone: data.timezone }),
      ...(data.countryCode !== undefined && { countryCode: data.countryCode }),
    })

    this.logger.log(`Updated AppUser ${updated.id} for authUserId: ${authUserId}`)
  }

  private toResponseDtoWithProfiles(appUser: AppUserWithProfiles): AppUserResponseDto {
    return {
      id: appUser.id,
      authUserId: appUser.authUserId,
      locale: appUser.locale,
      timezone: appUser.timezone,
      // countryCode: appUser.countryCode,
      createdAt: appUser.createdAt,
      organizerProfileId: appUser.organizerProfile?.id,
      participantProfileId: appUser.participantProfile?.id,
    }
  }

  async findById(id: number) {
    return this.appUserRepo.findById(id)
  }

  async findByAuthUsername(username: string) {
    return this.appUserRepo.findByAuthUsername(username)
  }

  async findByAuthEmail(email: string) {
    return this.appUserRepo.findByAuthEmail(email)
  }
}
