import { ProviderName, UnRegisteredUserCreateDto, UnRegisteredUserDto } from '@js-monorepo/types/auth'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { UnregisteredRepository } from '../../unregistered.repository'

@Injectable()
export class UnRegisteredUserRepositoryPrismaImpl implements UnregisteredRepository {
  constructor(private readonly txHost: TransactionHost<TransactionalAdapterPrisma>) {}

  async createUnRegisteredUser(unRegisteredUser: UnRegisteredUserCreateDto): Promise<UnRegisteredUserDto> {
    const provider = await this.txHost.tx.provider.findUniqueOrThrow({
      where: { name: unRegisteredUser.provider as ProviderName },
    })

    return this.txHost.tx.unRegisteredUser.upsert({
      where: { email: unRegisteredUser.email },
      update: {
        createdAt: new Date(),
        token: uuidv4(),
        providerId: provider.id,
        profileImage: unRegisteredUser.profileImage,
      },
      create: {
        email: unRegisteredUser.email,
        token: uuidv4(),
        providerId: provider.id,
        profileImage: unRegisteredUser.profileImage,
      },
    })
  }

  async findUnRegisteredUserByToken(token: string): Promise<UnRegisteredUserDto> {
    return this.txHost.tx.unRegisteredUser.findUniqueOrThrow({
      where: { token: token },
      include: {
        provider: true,
      },
    })
  }
}
