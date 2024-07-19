import { Inject, Injectable, Logger } from '@nestjs/common'
import { ChannelRepository } from '../repositories/interfaces/channel.repository'

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name)

  constructor(
    @Inject('CHANNEL_REPOSITORY')
    private channelRepository: ChannelRepository
  ) {}

  async assignUserToChannels(userId: number, ...channelNames: string[]) {
    try {
      this.logger.debug(
        `Assign user: '${userId}' in channels: '${channelNames.join(', ')}'`
      )
      await this.channelRepository.assignUserToChannels(userId, ...channelNames)
    } catch (error) {
      this.logger.error(
        `Error assigning user to channels for user with id: '${userId}'`,
        error
      )
    }
  }

  async getChannelsByUserId(userId: number) {
    this.logger.debug(`Fetching channels for user with id: '${userId}'`)
    try {
      return await this.channelRepository.getChannelsByUserId(userId)
    } catch (error) {
      this.logger.error(
        error,
        `Error fetching channels for user with id: '${userId}'`
      )
    }
    return []
  }
}
