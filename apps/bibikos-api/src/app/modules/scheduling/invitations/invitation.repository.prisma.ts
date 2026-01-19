import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { ClassInvitation, InvitationStatus, Prisma, PrismaClient } from '@js-monorepo/bibikos-db'
import { InvitationRepository, InvitationWithDetails } from './invitation.repository'

const invitationInclude = {
  class: {
    select: {
      id: true,
      title: true,
      description: true,
      isPrivate: true,
    },
  },
  organizer: {
    select: {
      id: true,
      displayName: true,
      slug: true,
    },
  },
  invitedUser: {
    select: {
      id: true,
      authUser: {
        select: {
          username: true,
          email: true,
        },
      },
    },
  },
} as const

@Injectable()
export class InvitationRepositoryPrisma implements InvitationRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaClient>>) {}

  async create(data: Prisma.ClassInvitationCreateInput): Promise<ClassInvitation> {
    return this.txHost.tx.classInvitation.create({ data })
  }

  async findById(id: number): Promise<InvitationWithDetails | null> {
    return this.txHost.tx.classInvitation.findUnique({
      where: { id },
      include: invitationInclude,
    })
  }

  async findByClassAndUser(classId: number, userId: number): Promise<ClassInvitation | null> {
    return this.txHost.tx.classInvitation.findUnique({
      where: {
        classId_invitedUserId: { classId, invitedUserId: userId },
      },
    })
  }

  async findByClassAndEmail(classId: number, email: string): Promise<ClassInvitation | null> {
    return this.txHost.tx.classInvitation.findFirst({
      where: { classId, invitedEmail: email },
    })
  }

  async findByClassAndUsername(classId: number, username: string): Promise<ClassInvitation | null> {
    return this.txHost.tx.classInvitation.findFirst({
      where: { classId, invitedUsername: username },
    })
  }

  async findPendingByUserId(userId: number): Promise<InvitationWithDetails[]> {
    return this.txHost.tx.classInvitation.findMany({
      where: {
        invitedUserId: userId,
        status: InvitationStatus.PENDING,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: invitationInclude,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByClassId(classId: number): Promise<InvitationWithDetails[]> {
    return this.txHost.tx.classInvitation.findMany({
      where: { classId },
      include: invitationInclude,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByOrganizerId(organizerId: number): Promise<InvitationWithDetails[]> {
    return this.txHost.tx.classInvitation.findMany({
      where: { organizerId },
      include: invitationInclude,
      orderBy: { createdAt: 'desc' },
    })
  }

  async update(id: number, data: Prisma.ClassInvitationUpdateInput): Promise<ClassInvitation> {
    return this.txHost.tx.classInvitation.update({
      where: { id },
      data,
    })
  }

  async updateStatus(id: number, status: InvitationStatus, respondedAt?: Date): Promise<ClassInvitation> {
    return this.txHost.tx.classInvitation.update({
      where: { id },
      data: {
        status,
        respondedAt: respondedAt ?? new Date(),
      },
    })
  }

  async delete(id: number): Promise<void> {
    await this.txHost.tx.classInvitation.delete({ where: { id } })
  }

  async linkUserToInvitation(invitationId: number, userId: number): Promise<ClassInvitation> {
    return this.txHost.tx.classInvitation.update({
      where: { id: invitationId },
      data: { invitedUserId: userId },
    })
  }

  async findPendingByEmail(email: string): Promise<InvitationWithDetails[]> {
    return this.txHost.tx.classInvitation.findMany({
      where: {
        invitedEmail: email,
        invitedUserId: null,
        status: InvitationStatus.PENDING,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: invitationInclude,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findPendingByUsername(username: string): Promise<InvitationWithDetails[]> {
    return this.txHost.tx.classInvitation.findMany({
      where: {
        invitedUsername: username,
        invitedUserId: null,
        status: InvitationStatus.PENDING,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: invitationInclude,
      orderBy: { createdAt: 'desc' },
    })
  }
}
