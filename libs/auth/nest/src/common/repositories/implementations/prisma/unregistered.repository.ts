import { PrismaService } from '@js-monorepo/db'
import {
  ProviderName,
  UnRegisteredUserCreateDto,
  UnRegisteredUserDto,
} from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { UnregisteredRepository } from '../../unregistered.repository'

@Injectable()
export class UnRegisteredUserRepositoryPrismaImpl
  implements UnregisteredRepository
{
  constructor(private readonly dbClient: PrismaService) {}

  async createUnRegisteredUser(
    unRegisteredUser: UnRegisteredUserCreateDto
  ): Promise<UnRegisteredUserDto> {
    const provider = await this.dbClient.provider.findUniqueOrThrow({
      where: { name: unRegisteredUser.provider as ProviderName },
    })

    return this.dbClient.unRegisteredUser.upsert({
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

  async findUnRegisteredUserByToken(
    token: string
  ): Promise<UnRegisteredUserDto> {
    return this.dbClient.unRegisteredUser.findUniqueOrThrow({
      where: { token: token },
      include: {
        provider: true,
      },
    })
  }
}
