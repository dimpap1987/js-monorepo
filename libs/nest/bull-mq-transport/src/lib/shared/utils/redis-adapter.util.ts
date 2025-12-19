import { RedisClientType } from 'redis'
import { ConnectionOptions } from 'bullmq'
import { createBullMqConnectionOptions } from './bullmq-connection-manager.util'

/**
 * Creates BullMQ connection options from Redis client
 * Uses shared ioredis connection to minimize connection count
 */
export function createBullMqConnectionFromRedisClient(
  redisClient: RedisClientType,
  redisUrl?: string
): ConnectionOptions {
  // Always use shared connection manager to reuse ioredis connection
  // This prevents BullMQ from creating multiple connections per worker
  if (!redisUrl) {
    throw new Error('Redis URL is required for BullMQ connection')
  }

  return createBullMqConnectionOptions(redisUrl)
}

