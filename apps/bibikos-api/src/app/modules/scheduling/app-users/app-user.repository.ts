import { AppUser, Prisma } from '@js-monorepo/bibikos-db'

export const AppUserRepo = Symbol('AppUserRepo')

export interface AppUserWithProfiles extends AppUser {
  organizerProfile: { id: number } | null
  participantProfile: { id: number } | null
}

export interface AppUserRepository {
  findByAuthUserId(authUserId: number): Promise<AppUser | null>
  findByAuthUserIdWithProfiles(authUserId: number): Promise<AppUserWithProfiles | null>
  findById(id: number): Promise<AppUser | null>
  create(data: Prisma.AppUserCreateInput): Promise<AppUser>
  update(id: number, data: Prisma.AppUserUpdateInput): Promise<AppUser>
  upsertByAuthUserId(authUserId: number, data: Omit<Prisma.AppUserCreateInput, 'authUser'>): Promise<AppUser>
}
