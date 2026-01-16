import { OrganizerProfile, Prisma } from '@js-monorepo/bibikos-db'

export const OrganizerRepo = Symbol('OrganizerRepo')

export interface OrganizerWithAppUser extends OrganizerProfile {
  appUser: {
    id: number
    authUserId: number
    fullName: string | null
  }
}

export interface OrganizerRepository {
  findById(id: number): Promise<OrganizerProfile | null>
  findByAppUserId(appUserId: number): Promise<OrganizerProfile | null>
  findBySlug(slug: string): Promise<OrganizerWithAppUser | null>
  create(data: Prisma.OrganizerProfileCreateInput): Promise<OrganizerProfile>
  update(id: number, data: Prisma.OrganizerProfileUpdateInput): Promise<OrganizerProfile>
  isSlugAvailable(slug: string, excludeId?: number): Promise<boolean>
}
