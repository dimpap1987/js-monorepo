import { Transactional } from '@nestjs-cls/transactional'
import { Injectable } from '@nestjs/common'
import { APP_USER_CONTEXT_KEY, BibikosCacheService } from '../modules/scheduling/cache'
import { AppUserService } from '../modules/scheduling'

@Injectable()
export class AppService {
  constructor(
    private readonly appUserService: AppUserService,
    private readonly cacheService: BibikosCacheService
  ) {}

  @Transactional()
  async findUserContext(authUserId: number): Promise<{
    appUserId: number
    authUserId: number
    participantId?: number | null
    organizerId?: number | null
  } | null> {
    return this.cacheService.getOrSet(
      APP_USER_CONTEXT_KEY,
      authUserId,
      async () => {
        const appUser = await this.appUserService.findByAuthId(authUserId)

        if (!appUser) return null

        return {
          appUserId: appUser.id,
          authUserId: appUser.authUserId,
          participantId: appUser.participantProfileId ?? null,
          organizerId: appUser.organizerProfileId ?? null,
        }
      },
      300
    )
  }
}
