import { ChannelDto } from '@js-monorepo/types'

export interface ChannelRepository {
  assignUserToChannels(userId: number, ...channelNames: string[]): Promise<any>

  getChannelsByUserId(userId: number): Promise<{ channel: ChannelDto }[]>
}
