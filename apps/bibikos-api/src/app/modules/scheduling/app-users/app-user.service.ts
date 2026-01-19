import { ApiException } from '@js-monorepo/nest/exceptions'
import { REDIS } from '@js-monorepo/nest/redis'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisClientType } from 'redis'
import { AppUserRepo, AppUserRepository, AppUserWithProfiles } from './app-user.repository'
import { AppUserResponseDto, UpdateAppUserDto } from './dto/app-user.dto'

@Injectable()
export class AppUserService {
  private readonly logger = new Logger(AppUserService.name)
  private readonly redisNamespace: string

  constructor(
    @Inject(AppUserRepo)
    private readonly appUserRepo: AppUserRepository,
    @Inject(REDIS)
    private readonly redis: RedisClientType,
    private readonly configService: ConfigService
  ) {
    this.redisNamespace = this.configService.get<string>('REDIS_NAMESPACE')
  }

  private getCacheKey(authUserId: number): string {
    return `${this.redisNamespace}:app-user:${authUserId}`
  }

  @Transactional()
  async getOrCreateAppUser(authUserId: number, defaults?: Partial<UpdateAppUserDto>): Promise<AppUserResponseDto> {
    const appUser = await this.getAppUser(authUserId)

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

    await this.setCache(authUserId, responseDto) // Cache the result
    return responseDto
  }

  async getAppUser(authUserId: number): Promise<AppUserResponseDto | null> {
    // Try to get from cache first
    const cached = await this.getCache(authUserId)
    if (cached) return cached

    // Cache miss - fetch from database
    const appUser = await this.appUserRepo.findByAuthUserIdWithProfiles(authUserId)
    if (!appUser) return null

    const responseDto = this.toResponseDtoWithProfiles(appUser)
    await this.setCache(authUserId, responseDto) // Cache the result
    return responseDto
  }

  @Transactional()
  async updateAppUser(authUserId: number, data: UpdateAppUserDto): Promise<AppUserResponseDto> {
    const appUser = await this.appUserRepo.findByAuthUserIdWithProfiles(authUserId)

    if (!appUser) throw new ApiException(HttpStatus.NOT_FOUND, 'APP_USER_NOT_FOUND')

    const updated = await this.appUserRepo.update(appUser.id, {
      ...(data.fullName !== undefined && { fullName: data.fullName }),
      ...(data.locale !== undefined && { locale: data.locale }),
      ...(data.timezone !== undefined && { timezone: data.timezone }),
      ...(data.countryCode !== undefined && { countryCode: data.countryCode }),
    })

    this.logger.log(`Updated AppUser ${updated.id} for authUserId: ${authUserId}`)
    // Return with current profile status
    const responseDto = this.toResponseDtoWithProfiles({
      ...updated,
      organizerProfile: appUser.organizerProfile,
      participantProfile: appUser.participantProfile,
    })
    // Invalidate and update cache
    await this.setCache(authUserId, responseDto)
    return responseDto
  }

  private async getCache(authUserId: number): Promise<AppUserResponseDto | null> {
    try {
      const cacheKey = this.getCacheKey(authUserId)
      const cached = await this.redis.get(cacheKey)
      if (!cached) {
        return null
      }
      return JSON.parse(cached) as AppUserResponseDto
    } catch (error: any) {
      this.logger.error(`Error reading AppUser cache for authUserId ${authUserId}: ${error.message}`, error.stack)
      return null
    }
  }

  private async setCache(authUserId: number, appUser: AppUserResponseDto): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(authUserId)
      await this.redis.set(cacheKey, JSON.stringify(appUser), {
        EX: 300,
      })
    } catch (error: any) {
      this.logger.error(`Error setting AppUser cache for authUserId ${authUserId}: ${error.message}`, error.stack)
      // Don't throw - caching failures shouldn't break the request
    }
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
