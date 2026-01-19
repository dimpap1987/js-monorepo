import { Class, Prisma } from '@js-monorepo/bibikos-db'

export const ClassRepo = Symbol('ClassRepo')

export interface ClassWithLocation extends Class {
  location: {
    id: number
    name: string
    timezone: string
    isOnline: boolean
  }
}

export interface ClassWithLocationAndOrganizer extends ClassWithLocation {
  organizer: {
    id: number
    displayName: string | null
    slug: string | null
    activityLabel: string | null
  }
}

export interface ClassRepository {
  findById(id: number): Promise<Class | null>
  findByIdWithLocation(id: number): Promise<ClassWithLocation | null>
  findByIdWithLocationAndOrganizer(id: number): Promise<ClassWithLocationAndOrganizer | null>
  findByOrganizerId(organizerId: number, includeInactive?: boolean): Promise<ClassWithLocation[]>
  create(data: Prisma.ClassCreateInput): Promise<Class>
  update(id: number, data: Prisma.ClassUpdateInput): Promise<Class>
  countByOrganizerId(organizerId: number, includeInactive?: boolean): Promise<number>
}
