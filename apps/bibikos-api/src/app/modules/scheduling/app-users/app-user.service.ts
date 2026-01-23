import { Inject, Injectable, Logger } from '@nestjs/common'
import { AppUserContextType } from '../../../../decorators/app-user.decorator'
import { APP_USER_KEY, BibikosCacheService } from '../cache'
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

  async createOrSelectByAuthUserId(authUserId: number, defaults?: Partial<UpdateAppUserDto>) {
    return this.cacheService.getOrSet(
      APP_USER_KEY,
      authUserId,
      async () => {
        const user = await this.appUserRepo.createOrSelectByAuthUserId(authUserId, defaults)
        return this.toResponseDtoWithProfiles(user)
      },
      300
    )
  }

  async findByAuthUserId(authUserId: number): Promise<AppUserResponseDto | null> {
    return this.cacheService.getOrSet(
      APP_USER_KEY,
      authUserId,
      async () => {
        const appUser = await this.appUserRepo.findByAuthUserIdWithProfiles(authUserId)

        if (!appUser) return null

        return this.toResponseDtoWithProfiles(appUser)
      },
      300
    )
  }

  async updateAppUser(appUserContext: AppUserContextType, data: UpdateAppUserDto): Promise<void> {
    const updated = await this.appUserRepo.update(appUserContext.appUserId, {
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.locale !== undefined && { locale: data.locale }),
      ...(data.timezone !== undefined && { timezone: data.timezone }),
      ...(data.countryCode !== undefined && { countryCode: data.countryCode }),
    })

    this.cacheService.invalidateUserByAuthId(appUserContext.user.id)
    this.logger.log(`Updated AppUser ${updated.id} for authUserId: ${appUserContext.user.id}`)
  }

  private toResponseDtoWithProfiles(appUser: AppUserWithProfiles): AppUserResponseDto {
    return {
      id: appUser.id,
      authUserId: appUser.authUserId,
      locale: appUser.locale,
      timezone: appUser.timezone,
      // countryCode: appUser.countryCode,
      // createdAt: appUser.createdAt,
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
