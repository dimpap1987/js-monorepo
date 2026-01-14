import { EditUserDto } from '@js-monorepo/types/auth'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { UserRepository } from './user.repository'

@Injectable()
export class UserRepositoryPrisma implements UserRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async editUser(payload: EditUserDto, userId: number, profileId: number): Promise<void> {
    const profileUpdates: { profileImage?: string; firstName?: string | null; lastName?: string | null } = {}
    const userUpdates: { username?: string } = {}

    if (payload.profileImage !== undefined) {
      profileUpdates.profileImage = payload.profileImage
    }

    // firstName and lastName are required - always update them
    if (payload.firstName !== undefined) {
      profileUpdates.firstName = payload.firstName.trim() || null
    }

    if (payload.lastName !== undefined) {
      profileUpdates.lastName = payload.lastName.trim() || null
    }

    if (payload.username !== undefined) {
      userUpdates.username = payload.username
    }

    // Update profile if there are profile changes
    if (Object.keys(profileUpdates).length > 0 && profileId) {
      await this.txHost.tx.userProfile.update({
        where: { id: profileId },
        data: profileUpdates,
      })
    }

    // Update user if there are user changes
    if (Object.keys(userUpdates).length > 0) {
      await this.txHost.tx.authUser.update({
        where: { id: userId },
        data: userUpdates,
      })
    }
  }

  async getUserProfile(
    userId: number,
    profileId: number
  ): Promise<{ firstName?: string | null; lastName?: string | null }> {
    if (!profileId) {
      return { firstName: null, lastName: null }
    }

    const profile = await this.txHost.tx.userProfile.findUnique({
      where: { id: profileId },
      select: {
        firstName: true,
        lastName: true,
      },
    })

    return {
      firstName: profile?.firstName ?? null,
      lastName: profile?.lastName ?? null,
    }
  }
}
