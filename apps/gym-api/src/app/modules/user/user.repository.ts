import { EditUserDto } from '@js-monorepo/types/auth'

export const UserRepo = Symbol()

export interface UserRepository {
  editUser(payload: EditUserDto, userId: number, profileId: number): Promise<void>
}
