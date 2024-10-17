import { ChannelDto } from '@js-monorepo/types'
import { TransactionHost } from '@nestjs-cls/transactional'
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma'
import { Injectable } from '@nestjs/common'
import { ChannelRepository } from './channel.repository'

@Injectable()
export class ChannelRepositoryPrisma implements ChannelRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>
  ) {}

  async assignUserToChannels(
    userId: number,
    ...channelNames: string[]
  ): Promise<any> {
    for (const channelName of channelNames) {
      // Find the channel by name
      const channel = await this.txHost.tx.channel.findUniqueOrThrow({
        where: { name: channelName },
      })

      // Register the user to the channel
      await this.txHost.tx.userChannel.create({
        data: {
          user: { connect: { id: userId } },
          channel: { connect: { id: channel.id } },
        },
      })
    }
  }

  async getChannelsByUserId(
    userId: number
  ): Promise<{ channel: ChannelDto }[]> {
    return this.txHost.tx.userChannel.findMany({
      where: {
        userId: userId,
      },
      select: {
        channel: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
          },
        },
      },
    })
  }
}
