import { PrismaService } from '@js-monorepo/db'
import {
  ProviderName,
  UserProfileCreateDto,
  UserProfileDto,
} from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import {
  ConstraintCode,
  ConstraintViolationException,
} from '../../../exceptions/contraint-violation'
import { UserProfileRepository } from '../../user-profile.repository'

@Injectable()
export class UserProfileRepositoryPrismaImpl implements UserProfileRepository {
  constructor(private readonly dbClient: PrismaService) {}

  async findUserProfileById(id: number): Promise<UserProfileDto> {
    return this.dbClient.userProfile.findUniqueOrThrow({
      where: { id },
      include: {
        provider: true,
      },
    })
  }

  async findUserProfilesByUserId(userId: number): Promise<UserProfileDto[]> {
    return this.dbClient.userProfile.findMany({
      where: { userId },
      include: {
        provider: true,
      },
    })
  }

  async createUserProfile(
    userProfileCreateDto: UserProfileCreateDto
  ): Promise<UserProfileDto> {
    return this.dbClient.userProfile
      .create({
        data: {
          userId: userProfileCreateDto.userId,
          providerId: userProfileCreateDto.providerId,
          profileImage: userProfileCreateDto.profileImage,
        },
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            throw new ConstraintViolationException(
              ConstraintCode.PROFILE_EXISTS
            )
          }
        }
        throw e
      })
  }

  async updateUserProfile(
    id: number,
    userProfileUpdateDto: Partial<UserProfileCreateDto>
  ): Promise<UserProfileDto> {
    return this.dbClient.userProfile.update({
      where: { id },
      data: userProfileUpdateDto,
    })
  }

  async findUserProfilesByUserIdAndProviderName(
    userId: number,
    providerName: ProviderName
  ): Promise<UserProfileDto[]> {
    return this.dbClient.userProfile.findMany({
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
