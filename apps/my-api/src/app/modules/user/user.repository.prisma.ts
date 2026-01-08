import { EditUserDto } from '@js-monorepo/types/auth'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { UserRepository } from './user.repository'

@Injectable()
export class UserRepositoryPrisma implements UserRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async editUser(payload: EditUserDto, userId: number, profileId: number): Promise<void> {
    if (payload.profileImage && profileId) {
      await this.txHost.tx.userProfile.update({
        where: { id: profileId },
        data: {
          profileImage: payload.profileImage,
        },
      })
    }

    if (payload.username) {
      await this.txHost.tx.authUser.update({
        where: { id: userId },
        data: {
          username: payload.username,
        },
      })
    }
  }
}
