import { Location, Prisma } from '@js-monorepo/bibikos-db'

export const LocationRepo = Symbol('LocationRepo')

export interface LocationRepository {
  findById(id: number): Promise<Location | null>
  findByOrganizerId(organizerId: number, includeInactive?: boolean): Promise<Location[]>
  create(data: Prisma.LocationCreateInput): Promise<Location>
  update(id: number, data: Prisma.LocationUpdateInput): Promise<Location>
  delete(id: number): Promise<void>
}
