import { AppUser, Prisma } from '@js-monorepo/bibikos-db'

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
  findByAuthIdWithProfiles(authUserId: number): Promise<AppUserWithProfiles | null>
  create(data: Prisma.AppUserCreateInput): Promise<AppUser>
  update(id: number, data: Prisma.AppUserUpdateInput): Promise<AppUser>
  upsertByAuthUserId(authUserId: number, data: Omit<Prisma.AppUserCreateInput, 'authUser'>): Promise<AppUser>
  findById(id: number): Promise<AppUser>
  findByAuthEmail(email: string): Promise<AppUserWithAuthUser>
  findByAuthUsername(username: string): Promise<AppUserWithAuthUser>
}
