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
   * Get public profile by slug (for /instructor/:slug page)
   * Returns enriched profile with profile image, tags, badges, and class types
   */
  async getPublicProfile(slug: string): Promise<OrganizerPublicProfileDto | null> {
    const organizer = await this.organizerRepo.findBySlugWithPublicProfile(slug)
    if (!organizer) return null

    // Extract profile image from auth user's profile
    const profileImage = organizer.appUser.authUser.userProfiles[0]?.profileImage ?? null

    // Separate badges (admin-assigned, empty applicableTo) from self-selected tags
    const badges = organizer.tags
      .filter((tagOnOrganizer) => tagOnOrganizer.tag.applicableTo.length === 0)
      .map((tagOnOrganizer) => ({
        id: tagOnOrganizer.tag.id,
        name: tagOnOrganizer.tag.name,
      }))

    // Self-selected tags (those with ORGANIZER in applicableTo)
    const tags = organizer.tags
      .filter((tagOnOrganizer) => tagOnOrganizer.tag.applicableTo.includes('ORGANIZER'))
      .map((tagOnOrganizer) => ({
        id: tagOnOrganizer.tag.id,
        name: tagOnOrganizer.tag.name,
        category: tagOnOrganizer.tag.category?.name ?? null,
      }))

    // Get unique class types (distinct titles)
    const classTypes = organizer.classes.map((cls) => ({
      id: cls.id,
      title: cls.title,
    }))

    return {
      displayName: organizer.displayName,
      bio: organizer.bio,
      slug: organizer.slug,
      profileImage,
      tags,
      badges,
      classTypes,
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

    const organizer = await this.organizerRepo.create({
      appUser: { connect: { id: appUserContext.appUserId } },
      displayName: dto?.displayName ?? null,
      bio: dto?.bio ?? null,
      slug: dto?.slug ?? null,
      ...(dto?.defaultLocationId && {
        defaultLocation: { connect: { id: dto.defaultLocationId } },
      }),
      tags: {
        createMany: {
          data: dto.tagIds.map((tagId) => ({ tagId })),
        },
      },
    })

    this.logger.log(`Created organizer profile ${organizer.id} for appUser ${appUserContext.appUserId}`)
    this.cacheService.invalidateUserByAuthId(appUserContext.user.id)
    return this.toResponseDto(organizer)
  }

  /**
   * Update organizer profile
   */
  @Transactional()
  async updateOrganizer(appUserContext: AppUserContextType, dto: UpdateOrganizerDto): Promise<OrganizerResponseDto> {
    const organizer = await this.organizerRepo.findById(appUserContext.organizerId)

    if (!organizer) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ORGANIZER_NOT_FOUND')
    }

    // Verify ownership
    if (organizer.appUserId !== appUserContext.appUserId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'ORGANIZER_ACCESS_DENIED')
    }

    // Validate slug uniqueness if changing
    if (dto.slug && dto.slug !== organizer.slug) {
      const isAvailable = await this.organizerRepo.isSlugAvailable(dto.slug, appUserContext.organizerId)
      if (!isAvailable) {
        throw new ApiException(HttpStatus.CONFLICT, 'SLUG_ALREADY_TAKEN')
      }
    }

    const updated = await this.organizerRepo.update(appUserContext.organizerId, {
      ...(dto.displayName !== undefined && { displayName: dto.displayName }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
      ...(dto.slug !== undefined && { slug: dto.slug }),
      ...(dto.defaultLocationId !== undefined && {
        defaultLocation: dto.defaultLocationId ? { connect: { id: dto.defaultLocationId } } : { disconnect: true },
      }),
    })

    this.cacheService.invalidateUserByAuthId(appUserContext.user.id)
    this.logger.log(`Updated organizer profile ${appUserContext.organizerId}`)
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
    defaultLocationId: number | null
    createdAt: Date
  }): OrganizerResponseDto {
    return {
      id: organizer.id,
      displayName: organizer.displayName,
      bio: organizer.bio,
      slug: organizer.slug,
      defaultLocationId: organizer.defaultLocationId,
      createdAt: organizer.createdAt,
    }
  }
}
