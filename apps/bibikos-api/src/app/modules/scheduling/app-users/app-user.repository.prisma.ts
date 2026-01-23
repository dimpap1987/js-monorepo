import { AppUser, Prisma } from '@js-monorepo/bibikos-db'
import { ApiException } from '@js-monorepo/nest/exceptions'
import { DATE_CONFIG } from '@js-monorepo/utils/date'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { HttpStatus, Injectable } from '@nestjs/common'
import { DEFAULT_COUNTRY, DEFAULT_LOCALE } from '../../../../config/env.schema'
import { AppUserRepository, AppUserWithProfiles } from './app-user.repository'
import { UpdateAppUserDto } from './dto/app-user.dto'

@Injectable()
export class AppUserRepositoryPrisma implements AppUserRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findByAuthUserId(authUserId: number): Promise<AppUser | null> {
    return this.txHost.tx.appUser.findUnique({
      where: { authUserId },
    })
  }

  async findByAuthUserIdWithProfiles(authUserId: number): Promise<AppUserWithProfiles | null> {
    return this.txHost.tx.appUser.findUnique({
      where: { authUserId },
      include: {
        organizerProfile: { select: { id: true } },
        participantProfile: { select: { id: true } },
      },
    })
  }

  async findById(id: number) {
    try {
      const user = await this.txHost.tx.appUser.findUniqueOrThrow({ where: { id } })
      return user
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ApiException(HttpStatus.NOT_FOUND, 'USER_NOT_FOUND')
        }
      }
      throw error
    }
  }

  async create(data: Prisma.AppUserCreateInput): Promise<AppUser> {
    return this.txHost.tx.appUser.create({ data })
  }

  async update(id: number, data: Prisma.AppUserUpdateInput): Promise<AppUser> {
    return this.txHost.tx.appUser.update({
      where: { id },
      data,
    })
  }

  async findByAuthEmail(email: string) {
    return this.txHost.tx.appUser.findFirst({
      where: {
        authUser: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
      },
      include: {
        authUser: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    })
  }

  async findByAuthUsername(username: string) {
    return this.txHost.tx.appUser.findFirst({
      where: {
        authUser: {
          username,
        },
      },
      include: {
        authUser: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    })
  }

  async createOrSelectByAuthUserId(authUserId: number, userDto?: Partial<UpdateAppUserDto>) {
    return this.txHost.tx.appUser.upsert({
      where: { authUserId },
      update: {},
      create: {
        authUser: { connect: { id: authUserId } },
        locale: userDto?.locale ?? DEFAULT_LOCALE,
        timezone: userDto?.timezone ?? DATE_CONFIG.DEFAULT_USER_TIMEZONE,
        countryCode: userDto?.countryCode ?? DEFAULT_COUNTRY,
      },
    })
  }
}
