import { ApiException } from '@js-monorepo/nest/exceptions'
import { Transactional } from '@nestjs-cls/transactional'
import { forwardRef, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { ClassScheduleService } from '../class-schedules'
import { InvitationService } from '../invitations'
import { LocationService } from '../locations'
import { OrganizerService } from '../organizers'
import { ClassRepo, ClassRepository, ClassWithLocation } from './class.repository'
import { ClassViewResponseDto } from './dto/class-view.dto'
import { ClassResponseDto, CreateClassDto, UpdateClassDto } from './dto/class.dto'

@Injectable()
export class ClassService {
  private readonly logger = new Logger(ClassService.name)

  constructor(
    @Inject(ClassRepo)
    private readonly classRepo: ClassRepository,
    private readonly organizerService: OrganizerService,
    private readonly locationService: LocationService,
    @Inject(forwardRef(() => ClassScheduleService))
    private readonly classScheduleService: ClassScheduleService,
    private readonly invitationService: InvitationService
  ) {}

  /**
   * Get all classes for an organizer
   */
  async getClassesByOrganizer(organizerId: number, includeInactive = false): Promise<ClassResponseDto[]> {
    const classes = await this.classRepo.findByOrganizerId(organizerId, includeInactive)
    return classes.map(this.toResponseDto)
  }

  /**
   * Get a single class by ID
   */
  async getClass(classId: number, organizerId: number): Promise<ClassResponseDto> {
    const classEntity = await this.classRepo.findByIdWithLocation(classId)

    if (!classEntity) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'CLASS_NOT_FOUND')
    }

    // Verify ownership
    if (classEntity.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'CLASS_ACCESS_DENIED')
    }

    return this.toResponseDto(classEntity)
  }

  /**
   * Get a class for public view (e.g., booking page)
   * Does not verify ownership
   */
  async getClassPublic(classId: number): Promise<ClassResponseDto | null> {
    const classEntity = await this.classRepo.findByIdWithLocation(classId)

    if (!classEntity || !classEntity.isActive) {
      return null
    }

    return this.toResponseDto(classEntity)
  }

  /**
   * Get class view with schedules for booking
   * For private classes, user must have accepted invitation
   */
  async getClassView(classId: number, userId?: number): Promise<ClassViewResponseDto> {
    const classEntity = await this.classRepo.findByIdWithLocationAndOrganizer(classId)

    if (!classEntity || !classEntity.isActive) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'CLASS_NOT_FOUND')
    }

    // For private classes, check if user has accepted invitation
    if (classEntity.isPrivate) {
      if (!userId) {
        throw new ApiException(HttpStatus.FORBIDDEN, 'CLASS_ACCESS_DENIED')
      }

      const hasAccess = await this.invitationService.hasAcceptedInvitation(classId, userId)
      if (!hasAccess) {
        throw new ApiException(HttpStatus.FORBIDDEN, 'CLASS_ACCESS_DENIED')
      }
    }

    // Get upcoming schedules with booking counts
    const schedules = await this.classScheduleService.findUpcomingByClassIdWithBookingCounts(classId, 20)

    return {
      id: classEntity.id,
      title: classEntity.title,
      description: classEntity.description,
      capacity: classEntity.capacity,
      isPrivate: classEntity.isPrivate,
      location: classEntity.location,
      organizer: classEntity.organizer,
      schedules: schedules.map((schedule) => ({
        id: schedule.id,
        startTimeUtc: schedule.startTimeUtc,
        endTimeUtc: schedule.endTimeUtc,
        localTimezone: schedule.localTimezone,
        bookingCounts: schedule.bookingCounts || { booked: 0, waitlisted: 0 },
      })),
    }
  }

  /**
   * Create a new class
   */
  @Transactional()
  async createClass(organizerId: number, dto: CreateClassDto): Promise<ClassResponseDto> {
    // Verify organizer exists
    const organizer = await this.organizerService.findById(organizerId)
    if (!organizer) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ORGANIZER_NOT_FOUND')
    }

    // Verify location exists and belongs to organizer
    const location = await this.locationService.findById(dto.locationId)
    if (!location) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'LOCATION_NOT_FOUND')
    }
    if (location.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'LOCATION_ACCESS_DENIED')
    }

    const classEntity = await this.classRepo.create({
      organizer: { connect: { id: organizerId } },
      location: { connect: { id: dto.locationId } },
      title: dto.title,
      description: dto.description ?? null,
      capacity: dto.capacity ?? null,
      waitlistLimit: dto.waitlistLimit ?? null,
      isCapacitySoft: dto.isCapacitySoft ?? false,
      isPrivate: dto.isPrivate ?? false,
      tags: {
        connect: dto.tagIds.map((id) => ({ id })),
      },
    })

    this.logger.log(`Created class ${classEntity.id} for organizer ${organizerId}`)

    // Fetch with location for response
    const created = await this.classRepo.findByIdWithLocation(classEntity.id)
    return this.toResponseDto(created)
  }

  async findById(id: number) {
    return this.classRepo.findById(id)
  }

  async findByIdWithLocation(id: number) {
    return this.classRepo.findByIdWithLocation(id)
  }

  /**
   * Update a class
   */
  @Transactional()
  async updateClass(classId: number, organizerId: number, dto: UpdateClassDto): Promise<ClassResponseDto> {
    const classEntity = await this.classRepo.findById(classId)

    if (!classEntity) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'CLASS_NOT_FOUND')
    }

    // Verify ownership
    if (classEntity.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'CLASS_ACCESS_DENIED')
    }

    // If changing location, verify it belongs to organizer
    if (dto.locationId !== undefined && dto.locationId !== classEntity.locationId) {
      const location = await this.locationService.findById(dto.locationId)
      if (!location) {
        throw new ApiException(HttpStatus.NOT_FOUND, 'LOCATION_NOT_FOUND')
      }
      if (location.organizerId !== organizerId) {
        throw new ApiException(HttpStatus.FORBIDDEN, 'LOCATION_ACCESS_DENIED')
      }
    }

    await this.classRepo.update(classId, {
      ...(dto.locationId !== undefined && { location: { connect: { id: dto.locationId } } }),
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.capacity !== undefined && { capacity: dto.capacity }),
      ...(dto.waitlistLimit !== undefined && { waitlistLimit: dto.waitlistLimit }),
      ...(dto.isCapacitySoft !== undefined && { isCapacitySoft: dto.isCapacitySoft }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.isPrivate !== undefined && { isPrivate: dto.isPrivate }),
      ...(dto.tagIds && {
        tags: {
          set: dto.tagIds.map((id) => ({ id })),
        },
      }),
    })

    this.logger.log(`Updated class ${classId}`)

    // Fetch updated with location
    const updated = await this.classRepo.findByIdWithLocation(classId)
    return this.toResponseDto(updated)
  }

  /**
   * Soft delete a class (set isActive = false)
   */
  @Transactional()
  async deactivateClass(classId: number, organizerId: number): Promise<void> {
    const classEntity = await this.classRepo.findById(classId)

    if (!classEntity) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'CLASS_NOT_FOUND')
    }

    // Verify ownership
    if (classEntity.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'CLASS_ACCESS_DENIED')
    }

    await this.classRepo.update(classId, { isActive: false })
    this.logger.log(`Deactivated class ${classId}`)
  }

  private toResponseDto(classEntity: ClassWithLocation): ClassResponseDto {
    return {
      id: classEntity.id,
      organizerId: classEntity.organizerId,
      locationId: classEntity.locationId,
      title: classEntity.title,
      description: classEntity.description,
      capacity: classEntity.capacity,
      waitlistLimit: classEntity.waitlistLimit,
      isCapacitySoft: classEntity.isCapacitySoft,
      isActive: classEntity.isActive,
      isPrivate: classEntity.isPrivate,
      createdAt: classEntity.createdAt,
      location: classEntity.location,
      tags: classEntity.tags.map((tag) => ({ id: tag.id, name: tag.name })),
    }
  }
}
