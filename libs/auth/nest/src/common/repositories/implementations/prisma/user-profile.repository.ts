import { ProviderName } from '@js-monorepo/types/auth'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@js-monorepo/prisma-shared'
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
          firstName: userProfileCreateDto.firstName,
          lastName: userProfileCreateDto.lastName,
          accessToken: userProfileCreateDto.accessToken,
          refreshToken: userProfileCreateDto.refreshToken,
          tokenExpiry: userProfileCreateDto.tokenExpiry,
          scopes: userProfileCreateDto.scopes ?? [],
        },
      })
      .catch((e: unknown) => {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
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

  async upsertUserProfile(
    userId: number,
    providerName: ProviderName,
    data: Omit<UserProfileCreateDto, 'userId' | 'providerId'>
  ): Promise<UserProfileDto> {
    const provider = await this.txHost.tx.provider.findUniqueOrThrow({
      where: { name: providerName },
    })

    // Check if profile already exists
    const existingProfile = await this.txHost.tx.userProfile.findUnique({
      where: {
        userId_providerId: {
          userId,
          providerId: provider.id,
        },
      },
    })

    // Always update: tokens (these change on each OAuth login and are needed for API calls)
    // Conditionally update: profileImage, firstName/lastName (only if not set by user - preserve user edits)
    const updateData: Partial<UserProfileCreateDto> = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExpiry: data.tokenExpiry,
      scopes: data.scopes ?? [],
    }

    // Preserve user-edited profileImage, firstName, lastName: only update from OAuth if they're not set yet
    if (existingProfile) {
      // Profile exists: preserve existing values if they exist
      if (!existingProfile.profileImage && data.profileImage) {
        updateData.profileImage = data.profileImage
      }
      if (!existingProfile.firstName && data.firstName) {
        updateData.firstName = data.firstName
      }
      if (!existingProfile.lastName && data.lastName) {
        updateData.lastName = data.lastName
      }
    } else {
      // Profile doesn't exist: set all values from OAuth
      updateData.profileImage = data.profileImage
      updateData.firstName = data.firstName
      updateData.lastName = data.lastName
    }

    return this.txHost.tx.userProfile.upsert({
      where: {
        userId_providerId: {
          userId,
          providerId: provider.id,
        },
      },
      update: updateData,
      create: {
        userId,
        providerId: provider.id,
        profileImage: data.profileImage,
        firstName: data.firstName,
        lastName: data.lastName,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenExpiry: data.tokenExpiry,
        scopes: data.scopes ?? [],
      },
      include: {
        provider: true,
      },
    })
  }
}
