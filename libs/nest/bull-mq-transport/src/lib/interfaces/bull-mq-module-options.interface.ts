import { RedisClientType } from 'redis'

export interface BullMqModuleOptions {
  /**
   * Queue name prefix for all queues
   * @default 'bullmq'
   */
  queueNamePrefix?: string

  /**
   * Redis URL for creating BullMQ connection
   * If not provided, will try to use sharedConnection
   */
  redisUrl?: string

  /**
   * Shared Redis connection from RedisModule
   * This will be injected automatically if RedisModule is imported
   * Note: BullMQ uses ioredis, so if redisUrl is not provided,
   * we'll extract connection info from the shared connection
   */
  sharedConnection?: RedisClientType
}

export interface BullMqConsumerModuleOptions extends BullMqModuleOptions {
  /**
   * Enable consumer module
   * @default true
   */
  enabled?: boolean
}

export interface BullMqProducerModuleOptions extends BullMqModuleOptions {
  /**
   * Enable producer module
   * @default true
   */
  enabled?: boolean
}
