import { PrismaService } from '@js-monorepo/db'
import { ChannelDto } from '@js-monorepo/types'
import { Injectable } from '@nestjs/common'
import { ChannelRepository } from '../../interfaces/channel.repository'

@Injectable()
export class ChannelRepositoryPrisma implements ChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assignUserToChannels(
    userId: number,
    ...channelNames: string[]
  ): Promise<void> {
    for (const channelName of channelNames) {
      // Find the channel by name
      const channel = await this.prisma.channel.findUniqueOrThrow({
        where: { name: channelName },
      })

      // Register the user to the channel
      await this.prisma.userChannel.create({
        data: {
          user: { connect: { id: userId } },
          channel: { connect: { id: channel.id } },
        },
      })
    }
  }

  async getChannelsByUserId(userId: number): Promise<ChannelDto[]> {
    const userChannels = await this.prisma.userChannel.findMany({
      where: {
        userId: userId,
      },
      include: {
        channel: true,
      },
    })
    return userChannels?.map((userChannel) => userChannel.channel)
  }
}
