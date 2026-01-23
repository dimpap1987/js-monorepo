import { AppUser, Prisma } from '@js-monorepo/bibikos-db'
import { UpdateAppUserDto } from './dto/app-user.dto'

export const AppUserRepo = Symbol('AppUserRepo')

export interface AppUserWithProfiles extends AppUser {
  organizerProfile: { id: number } | null
  participantProfile: { id: number } | null
}

export type AppUserWithAuthUser = Prisma.AppUserGetPayload<{
  include: {
    authUser: {
      select: {
        id: true
        email: true
        username: true
      }
    }
  }
}>

export interface AppUserRepository {
  findByAuthUserId(authUserId: number): Promise<AppUser | null>
  findByAuthUserIdWithProfiles(authUserId: number): Promise<AppUserWithProfiles | null>
  create(data: Prisma.AppUserCreateInput): Promise<AppUser>
  update(id: number, data: Prisma.AppUserUpdateInput): Promise<AppUser>

  findById(id: number): Promise<AppUser>
  findByAuthEmail(email: string): Promise<AppUserWithAuthUser>
  findByAuthUsername(username: string): Promise<AppUserWithAuthUser>
  createOrSelectByAuthUserId(authUserId: number, defaults?: Partial<UpdateAppUserDto>)
}
