import { ProviderName } from '@js-monorepo/types/auth'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { ConstraintCode, ConstraintViolationException } from '../../../exceptions/contraint-violation'
import { UserProfileRepository } from '../../user-profile.repository'
import { UserProfileCreateDto, UserProfileDto } from '@js-monorepo/types/user-profile'

@Injectable()
export class UserProfileRepositoryPrismaImpl implements UserProfileRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async findUserProfileById(id: number): Promise<UserProfileDto> {
    return this.txHost.tx.userProfile.findUniqueOrThrow({
      where: { id },
      include: {
        provider: true,
      },
    })
  }

  async findUserProfilesByUserId(userId: number): Promise<UserProfileDto[]> {
    return this.txHost.tx.userProfile.findMany({
      where: { userId },
      include: {
        provider: true,
      },
    })
  }

  async createUserProfile(userProfileCreateDto: UserProfileCreateDto): Promise<UserProfileDto> {
    return this.txHost.tx.userProfile
      .create({
        data: {
          userId: userProfileCreateDto.userId,
          providerId: userProfileCreateDto.providerId,
          profileImage: userProfileCreateDto.profileImage,
        },
      })
      .catch((e: unknown) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new ConstraintViolationException(ConstraintCode.PROFILE_EXISTS)
          }
        }
        throw e
      })
  }

  async updateUserProfile(id: number, userProfileUpdateDto: Partial<UserProfileCreateDto>): Promise<UserProfileDto> {
    return this.txHost.tx.userProfile.update({
      where: { id },
      data: userProfileUpdateDto,
    })
  }

  async findUserProfilesByUserIdAndProviderName(userId: number, providerName: ProviderName): Promise<UserProfileDto[]> {
    return this.txHost.tx.userProfile.findMany({
      where: {
        userId,
        provider: {
          name: providerName,
        },
      },
      include: {
        provider: true,
      },
    })
  }
}
