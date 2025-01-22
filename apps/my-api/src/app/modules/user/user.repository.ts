import { EditUserDto } from '@js-monorepo/types'

export const UserRepo = Symbol()

export interface UserRepository {
  editUser(payload: EditUserDto, userId: number, profileId: number): Promise<void>
}
