import { ProviderName } from '@js-monorepo/types/auth'
import { UserProfileDto, UserProfileCreateDto } from '@js-monorepo/types/user-profile'

export interface UserProfileRepository {
  findUserProfileById(id: number): Promise<UserProfileDto>

  findUserProfilesByUserId(userId: number): Promise<UserProfileDto[]>

  createUserProfile(userProfileCreateDto: UserProfileCreateDto): Promise<UserProfileDto>

  updateUserProfile(id: number, userProfileUpdateDto: Partial<UserProfileCreateDto>): Promise<UserProfileDto>

  findUserProfilesByUserIdAndProviderName(userId: number, providerName: ProviderName): Promise<UserProfileDto[]>
}
