import { ChannelDto } from '@js-monorepo/types'

export interface ChannelRepository {
  assignUserToChannels(userId: number, ...channelNames: string[]): Promise<void>

  getChannelsByUserId(userId: number): Promise<ChannelDto[]>
}
