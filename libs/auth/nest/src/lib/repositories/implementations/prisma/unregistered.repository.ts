import {
  UnRegisteredUserCreateDto,
  UnRegisteredUserDto,
} from '@js-monorepo/types'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { PrismaClient, ProviderEnum } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { UnregisteredRepository } from '../../unregistered.repository'

@Injectable()
export class UnRegisteredUserRepositoryPrismaImpl
  implements UnregisteredRepository
{
  private readonly logger = new Logger(
    UnRegisteredUserRepositoryPrismaImpl.name
  )

  constructor(@Inject('DB_CLIENT') private readonly dbClient: PrismaClient) {}

  async createUnRegisteredUser(
    unRegisteredUser: UnRegisteredUserCreateDto
  ): Promise<UnRegisteredUserDto> {
    return this.dbClient.unRegisteredUser.upsert({
      where: { email: unRegisteredUser.email },
      update: {
        createdAt: new Date(),
        token: uuidv4(),
        provider: unRegisteredUser.provider as ProviderEnum,
        profileImage: unRegisteredUser.profileImage,
      },
      create: {
        email: unRegisteredUser.email,
        token: uuidv4(),
        provider: unRegisteredUser.provider as ProviderEnum,
        profileImage: unRegisteredUser.profileImage,
      },
    })
  }

  async findUnRegisteredUserByToken(
    token: string
  ): Promise<UnRegisteredUserDto> {
    return this.dbClient.unRegisteredUser.findUniqueOrThrow({
      where: { token: token },
    })
  }
}
