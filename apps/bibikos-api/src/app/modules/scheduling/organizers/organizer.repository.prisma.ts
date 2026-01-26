import { OrganizerProfile, Prisma } from '@js-monorepo/bibikos-db'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { OrganizerRepository, OrganizerWithAppUser, OrganizerPublicProfileData } from './organizer.repository'

@Injectable()
export class OrganizerRepositoryPrisma implements OrganizerRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findById(id: number): Promise<OrganizerProfile | null> {
    return this.txHost.tx.organizerProfile.findUnique({
      where: { id },
    })
  }

  async findByAppUserId(appUserId: number): Promise<OrganizerProfile | null> {
    return this.txHost.tx.organizerProfile.findUnique({
      where: { appUserId },
    })
  }

  async findBySlug(slug: string): Promise<OrganizerWithAppUser | null> {
    return this.txHost.tx.organizerProfile.findUnique({
      where: { slug },
      include: {
        appUser: {
          select: {
            id: true,
            authUserId: true,
            fullName: true,
          },
        },
      },
    })
  }

  async findBySlugWithPublicProfile(slug: string): Promise<OrganizerPublicProfileData | null> {
    return this.txHost.tx.organizerProfile.findUnique({
      where: { slug },
      include: {
        appUser: {
          select: {
            id: true,
            authUserId: true,
            fullName: true,
            authUser: {
              select: {
                userProfiles: {
                  select: {
                    profileImage: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                applicableTo: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        classes: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            title: true,
            isActive: true,
          },
          distinct: ['title'],
        },
      },
    })
  }

  async create(data: Prisma.OrganizerProfileCreateInput): Promise<OrganizerProfile> {
    return this.txHost.tx.organizerProfile.create({ data })
  }

  async update(id: number, data: Prisma.OrganizerProfileUpdateInput): Promise<OrganizerProfile> {
    return this.txHost.tx.organizerProfile.update({
      where: { id },
      data,
    })
  }

  async isSlugAvailable(slug: string, excludeId?: number): Promise<boolean> {
    const existing = await this.txHost.tx.organizerProfile.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })
    return !existing
  }
}
