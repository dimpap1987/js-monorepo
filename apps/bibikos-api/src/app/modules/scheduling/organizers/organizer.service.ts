import { ApiException } from '@js-monorepo/nest/exceptions'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import {
  CreateOrganizerDto,
  OrganizerPublicProfileDto,
  OrganizerResponseDto,
  UpdateOrganizerDto,
} from './dto/organizer.dto'
import { OrganizerRepo, OrganizerRepository } from './organizer.repository'
import { BibikosCacheService } from '../cache'
import { AppUserContextType } from '../../../../decorators/app-user.decorator'

@Injectable()
export class OrganizerService {
  private readonly logger = new Logger(OrganizerService.name)

  constructor(
    @Inject(OrganizerRepo)
    private readonly organizerRepo: OrganizerRepository,
    private readonly cacheService: BibikosCacheService
  ) {}

  /**
   * Get organizer profile by app user ID
   */
  async findByAppUserId(appUserId: number): Promise<OrganizerResponseDto | null> {
    const organizer = await this.organizerRepo.findByAppUserId(appUserId)
    return organizer ? this.toResponseDto(organizer) : null
  }

  /**
   * Get organizer profile by ID
   */
  async findById(organizerId: number): Promise<OrganizerResponseDto | null> {
    const organizer = await this.organizerRepo.findById(organizerId)
    return organizer ? this.toResponseDto(organizer) : null
  }

  /**
   * Get public profile by slug (for /coach/:slug page)
   */
  async getPublicProfile(slug: string): Promise<OrganizerPublicProfileDto | null> {
    const organizer = await this.organizerRepo.findBySlug(slug)
    if (!organizer) return null

    return {
      displayName: organizer.displayName,
      bio: organizer.bio,
      slug: organizer.slug,
      activityLabel: organizer.activityLabel,
    }
  }

  async findBySlug(slug: string) {
    return this.organizerRepo.findBySlug(slug)
  }
  /**
   * Create or get organizer profile for an app user
   * A user becomes an organizer when they want to create classes
   */
  @Transactional()
  async createOrGetOrganizer(
    appUserContext: AppUserContextType,
    dto?: CreateOrganizerDto
  ): Promise<OrganizerResponseDto> {
    // Check if already an organizer
    const existing = await this.organizerRepo.findByAppUserId(appUserContext.appUserId)
    if (existing) {
      return this.toResponseDto(existing)
    }

    // Validate slug uniqueness if provided
    if (dto?.slug) {
      const isAvailable = await this.organizerRepo.isSlugAvailable(dto.slug)
      if (!isAvailable) {
        throw new ApiException(HttpStatus.CONFLICT, 'SLUG_ALREADY_TAKEN')
      }
    }

    // activityLabel is required when creating an organizer
    if (!dto?.activityLabel) {
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ACTIVITY_LABEL_REQUIRED')
    }

    const organizer = await this.organizerRepo.create({
      appUser: { connect: { id: appUserContext.appUserId } },
      displayName: dto?.displayName ?? null,
      bio: dto?.bio ?? null,
      slug: dto?.slug ?? null,
      activityLabel: dto.activityLabel,
      cancellationPolicy: dto?.cancellationPolicy ?? null,
      ...(dto?.defaultLocationId && {
        defaultLocation: { connect: { id: dto.defaultLocationId } },
      }),
    })

    this.logger.log(`Created organizer profile ${organizer.id} for appUser ${appUserContext.appUserId}`)
    this.cacheService.invalidateUserByAuthId(appUserContext.user.id)
    return this.toResponseDto(organizer)
  }

  /**
   * Update organizer profile
   */
  @Transactional()
  async updateOrganizer(
    organizerId: number,
    appUserId: number,
    dto: UpdateOrganizerDto
  ): Promise<OrganizerResponseDto> {
    const organizer = await this.organizerRepo.findById(organizerId)

    if (!organizer) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ORGANIZER_NOT_FOUND')
    }

    // Verify ownership
    if (organizer.appUserId !== appUserId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'ORGANIZER_ACCESS_DENIED')
    }

    // Validate slug uniqueness if changing
    if (dto.slug && dto.slug !== organizer.slug) {
      const isAvailable = await this.organizerRepo.isSlugAvailable(dto.slug, organizerId)
      if (!isAvailable) {
        throw new ApiException(HttpStatus.CONFLICT, 'SLUG_ALREADY_TAKEN')
      }
    }

    const updated = await this.organizerRepo.update(organizerId, {
      ...(dto.displayName !== undefined && { displayName: dto.displayName }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.slug !== undefined && { slug: dto.slug }),
      ...(dto.activityLabel !== undefined && { activityLabel: dto.activityLabel }),
      ...(dto.cancellationPolicy !== undefined && { cancellationPolicy: dto.cancellationPolicy }),
      ...(dto.defaultLocationId !== undefined && {
        defaultLocation: dto.defaultLocationId ? { connect: { id: dto.defaultLocationId } } : { disconnect: true },
      }),
    })

    this.logger.log(`Updated organizer profile ${organizerId}`)
    return this.toResponseDto(updated)
  }

  /**
   * Check if a slug is available
   */
  async checkSlugAvailability(slug: string, excludeOrganizerId?: number): Promise<boolean> {
    return this.organizerRepo.isSlugAvailable(slug, excludeOrganizerId)
  }

  private toResponseDto(organizer: {
    id: number
    displayName: string | null
    bio: string | null
    slug: string | null
    activityLabel: string | null
    cancellationPolicy: string | null
    defaultLocationId: number | null
    createdAt: Date
  }): OrganizerResponseDto {
    return {
      id: organizer.id,
      displayName: organizer.displayName,
      bio: organizer.bio,
      slug: organizer.slug,
      activityLabel: organizer.activityLabel,
      cancellationPolicy: organizer.cancellationPolicy,
      defaultLocationId: organizer.defaultLocationId,
      createdAt: organizer.createdAt,
    }
  }
}
