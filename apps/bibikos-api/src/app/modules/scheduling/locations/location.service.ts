import { ApiException } from '@js-monorepo/nest/exceptions'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { OrganizerService } from '../organizers'
import { CreateLocationDto, LocationResponseDto, UpdateLocationDto } from './dto/location.dto'
import { LocationRepo, LocationRepository } from './location.repository'

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name)

  constructor(
    @Inject(LocationRepo)
    private readonly locationRepo: LocationRepository,
    private readonly organizerService: OrganizerService
  ) {}

  /**
   * Get all locations for an organizer
   */
  async getLocationsByOrganizer(organizerId: number, includeInactive = false): Promise<LocationResponseDto[]> {
    const locations = await this.locationRepo.findByOrganizerId(organizerId, includeInactive)
    return locations.map(this.toResponseDto)
  }

  /**
   * Get a single location by ID
   */
  async getLocation(locationId: number, organizerId: number): Promise<LocationResponseDto> {
    const location = await this.locationRepo.findById(locationId)

    if (!location) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'LOCATION_NOT_FOUND')
    }

    // Verify ownership
    if (location.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'LOCATION_ACCESS_DENIED')
    }

    return this.toResponseDto(location)
  }

  /**
   * Create a new location
   */
  @Transactional()
  async createLocation(organizerId: number, dto: CreateLocationDto): Promise<LocationResponseDto> {
    // Verify organizer exists
    const organizer = await this.organizerService.findById(organizerId)
    if (!organizer) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'ORGANIZER_NOT_FOUND')
    }

    const location = await this.locationRepo.create({
      organizer: { connect: { id: organizerId } },
      name: dto.name,
      countryCode: dto.countryCode,
      city: dto.city ?? null,
      address: dto.address ?? null,
      timezone: dto.timezone,
      isOnline: dto.isOnline ?? false,
      onlineUrl: dto.onlineUrl ?? null,
    })

    this.logger.log(`Created location ${location.id} for organizer ${organizerId}`)
    return this.toResponseDto(location)
  }

  async findById(id: number) {
    return this.locationRepo.findById(id)
  }

  /**
   * Update a location
   */
  @Transactional()
  async updateLocation(locationId: number, organizerId: number, dto: UpdateLocationDto): Promise<LocationResponseDto> {
    const location = await this.locationRepo.findById(locationId)

    if (!location) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'LOCATION_NOT_FOUND')
    }

    // Verify ownership
    if (location.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'LOCATION_ACCESS_DENIED')
    }

    const updated = await this.locationRepo.update(locationId, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.countryCode !== undefined && { countryCode: dto.countryCode }),
      ...(dto.city !== undefined && { city: dto.city }),
      ...(dto.address !== undefined && { address: dto.address }),
      ...(dto.timezone !== undefined && { timezone: dto.timezone }),
      ...(dto.isOnline !== undefined && { isOnline: dto.isOnline }),
      ...(dto.onlineUrl !== undefined && { onlineUrl: dto.onlineUrl }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    })

    this.logger.log(`Updated location ${locationId}`)
    return this.toResponseDto(updated)
  }

  /**
   * Soft delete a location (set isActive = false)
   */
  @Transactional()
  async deactivateLocation(locationId: number, organizerId: number): Promise<void> {
    const location = await this.locationRepo.findById(locationId)

    if (!location) {
      throw new ApiException(HttpStatus.NOT_FOUND, 'LOCATION_NOT_FOUND')
    }

    // Verify ownership
    if (location.organizerId !== organizerId) {
      throw new ApiException(HttpStatus.FORBIDDEN, 'LOCATION_ACCESS_DENIED')
    }

    await this.locationRepo.update(locationId, { isActive: false })
    this.logger.log(`Deactivated location ${locationId}`)
  }

  private toResponseDto(location: {
    id: number
    name: string
    countryCode: string
    city: string | null
    address: string | null
    timezone: string
    isOnline: boolean
    onlineUrl: string | null
    isActive: boolean
    createdAt: Date
  }): LocationResponseDto {
    return {
      id: location.id,
      name: location.name,
      countryCode: location.countryCode,
      city: location.city,
      address: location.address,
      timezone: location.timezone,
      isOnline: location.isOnline,
      onlineUrl: location.onlineUrl,
      isActive: location.isActive,
      createdAt: location.createdAt,
    }
  }
}
