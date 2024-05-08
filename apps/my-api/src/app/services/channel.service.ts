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

      const existingUserChannel = await this.prisma.userChannel.findFirst({
        where: { user_id: userId, channel_id: globalChannel.id },
      })

      if (existingUserChannel) {
        // User is already registered to the global channel
        return
      }

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
}
