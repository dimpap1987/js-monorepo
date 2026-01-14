import { EditUserDto } from '@js-monorepo/types/auth'

export const UserRepo = Symbol()

export interface UserProfileData {
  firstName?: string | null
  lastName?: string | null
}

export interface UserRepository {
  editUser(payload: EditUserDto, userId: number, profileId: number): Promise<void>
  getUserProfile(userId: number, profileId: number): Promise<UserProfileData>
}
