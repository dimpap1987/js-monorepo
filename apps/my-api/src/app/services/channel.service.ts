import { PrismaService } from '@js-monorepo/db'
import { Injectable, Logger } from '@nestjs/common'
import { ApiException } from '../exceptions/api-exception'

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService) {}

  async assignUserToChannels(userId: number, ...channelNames: string[]) {
    try {
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
    } catch (error) {
      Logger.error(
        error,
        `Error assigning user to channels for user with id: '${userId}'`
      )
    }
  }

  async getChannelsByUserId(userId: number) {
    try {
      const userChannels = await this.prisma.userChannel.findMany({
        where: {
          user_id: userId,
        },
        include: {
          channel: true,
        },
      })

      return userChannels?.map((userChannel) => userChannel.channel)
    } catch (error) {
      Logger.error(
        error,
        `Error fetching channels for user with id: '${userId}'`
      )
      throw new ApiException()
    }
  }
}
