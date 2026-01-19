import { ClassInvitation, InvitationStatus, Prisma } from '@js-monorepo/bibikos-db'

export const InvitationRepo = Symbol('InvitationRepo')

export type InvitationWithDetails = ClassInvitation & {
  class: {
    id: number
    title: string
    description: string | null
    isPrivate: boolean
  }
  organizer: {
    id: number
    displayName: string | null
    slug: string | null
  }
  invitedUser: {
    id: number
    authUser: {
      username: string
      email: string
    }
  } | null
}

export interface InvitationRepository {
  create(data: Prisma.ClassInvitationCreateInput): Promise<ClassInvitation>
  findById(id: number): Promise<InvitationWithDetails | null>
  findByClassAndUser(classId: number, userId: number): Promise<ClassInvitation | null>
  findByClassAndEmail(classId: number, email: string): Promise<ClassInvitation | null>
  findByClassAndUsername(classId: number, username: string): Promise<ClassInvitation | null>
  findPendingByUserId(userId: number): Promise<InvitationWithDetails[]>
  findByClassId(classId: number): Promise<InvitationWithDetails[]>
  findByOrganizerId(organizerId: number): Promise<InvitationWithDetails[]>
  update(id: number, data: Prisma.ClassInvitationUpdateInput): Promise<ClassInvitation>
  updateStatus(id: number, status: InvitationStatus, respondedAt?: Date): Promise<ClassInvitation>
  delete(id: number): Promise<void>
  linkUserToInvitation(invitationId: number, userId: number): Promise<ClassInvitation>
  findPendingByEmail(email: string): Promise<InvitationWithDetails[]>
  findPendingByUsername(username: string): Promise<InvitationWithDetails[]>
}
