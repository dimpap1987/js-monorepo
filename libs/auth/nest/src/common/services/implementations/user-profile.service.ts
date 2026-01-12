import { ProviderName } from '@js-monorepo/types/auth'
import { Inject, Injectable } from '@nestjs/common'
import { UserProfileRepository } from '../../repositories/user-profile.repository'
import { RepoUserProfile } from '../../types'
import { UserProfileService } from '../interfaces/user-profile.service'
import { UserProfileCreateDto, UserProfileDto } from '@js-monorepo/types/user-profile'

@Injectable()
export class UserProfileServiceImpl implements UserProfileService {
  constructor(
    @Inject(RepoUserProfile)
    private readonly userProfileRepository: UserProfileRepository
  ) {}

  async findUserProfileById(id: number): Promise<UserProfileDto> {
    return this.userProfileRepository.findUserProfileById(id)
  }

  async findUserProfilesByUserId(userId: number): Promise<UserProfileDto[]> {
    return this.userProfileRepository.findUserProfilesByUserId(userId)
  }

  async findUserProfilesByUserIdAndProviderName(userId: number, providerName: ProviderName): Promise<UserProfileDto[]> {
    return this.userProfileRepository.findUserProfilesByUserIdAndProviderName(userId, providerName)
  }

  async createUserProfile(userProfileCreateDto: UserProfileCreateDto): Promise<UserProfileDto> {
    return this.userProfileRepository.createUserProfile(userProfileCreateDto)
  }

  async updateUserProfile(id: number, userProfileUpdateDto: Partial<UserProfileCreateDto>): Promise<UserProfileDto> {
    return this.userProfileRepository.updateUserProfile(id, userProfileUpdateDto)
  }

  async upsertUserProfile(
    userId: number,
    providerName: ProviderName,
    data: Omit<UserProfileCreateDto, 'userId' | 'providerId'>
  ): Promise<UserProfileDto> {
    return this.userProfileRepository.upsertUserProfile(userId, providerName, data)
  }
}
