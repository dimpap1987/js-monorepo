import { UserProfileCreateDto, UserProfileDto } from '@js-monorepo/types'

export interface UserProfileService {
  findUserProfileById(id: number): Promise<UserProfileDto>

  findUserProfilesByUserId(userId: number): Promise<UserProfileDto[]>

  findUserProfilesByUserIdAndProviderName(
    userId: number,
    providerName: string
  ): Promise<UserProfileDto[]>

  createUserProfile(
    userProfileCreateDto: UserProfileCreateDto
  ): Promise<UserProfileDto>

  updateUserProfile(
    id: number,
    userProfileUpdateDto: Partial<UserProfileCreateDto>
  ): Promise<UserProfileDto>
}
