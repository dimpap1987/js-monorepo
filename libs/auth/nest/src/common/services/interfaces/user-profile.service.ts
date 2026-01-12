import { ProviderName } from '@js-monorepo/types/auth'
import { UserProfileCreateDto, UserProfileDto } from '@js-monorepo/types/user-profile'

export interface UserProfileService {
  findUserProfileById(id: number): Promise<UserProfileDto>

  findUserProfilesByUserId(userId: number): Promise<UserProfileDto[]>

  findUserProfilesByUserIdAndProviderName(userId: number, providerName: string): Promise<UserProfileDto[]>

  createUserProfile(userProfileCreateDto: UserProfileCreateDto): Promise<UserProfileDto>

  updateUserProfile(id: number, userProfileUpdateDto: Partial<UserProfileCreateDto>): Promise<UserProfileDto>

  upsertUserProfile(
    userId: number,
    providerName: ProviderName,
    data: Omit<UserProfileCreateDto, 'userId' | 'providerId'>
  ): Promise<UserProfileDto>
}
