// channel.service.ts

import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService) {}

  async registerUserToGlobalChannel(userId: number) {
    try {
      // Find the "global" channel
      const globalChannel = await this.prisma.channel.findUniqueOrThrow({
        where: { name: 'global' },
      })

      // Register the user to the global channel
      await this.prisma.userChannel.create({
        data: {
          user: { connect: { id: userId } },
          channel: { connect: { id: globalChannel.id } },
        },
      })
    } catch (error) {
      console.error('Error registering user to global channel:', error)
      throw new Error('Failed to register user to global channel')
    }
  }

  async getChannelsByUsername(username: string) {
    try {
      const userChannels = await this.prisma.userChannel.findMany({
        where: {
          user: {
            username: username,
          },
        },
        include: {
          channel: true,
        },
      })

      const channels = userChannels?.map((userChannel) => userChannel.channel)

      return channels
    } catch (error) {
      console.error('Error fetching channels:', error)
      throw error
    }
  }
}
