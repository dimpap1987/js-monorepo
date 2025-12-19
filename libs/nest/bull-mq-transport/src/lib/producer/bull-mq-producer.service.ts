import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { Queue, QueueOptions } from 'bullmq'
import { RedisClientType } from 'redis'
import { createBullMqConnectionFromRedisClient } from '../shared/utils/redis-adapter.util'

@Injectable()
export class BullMqProducerService implements OnModuleDestroy {
  private readonly logger = new Logger(BullMqProducerService.name)
  private readonly queues = new Map<string, Queue>()

  constructor(
    private readonly redisClient: RedisClientType,
    private readonly queueNamePrefix?: string,
    private readonly redisUrl?: string
  ) {}

  /**
   * Get or create a queue for producing jobs
   */
  getQueue(queueName: string, options?: Partial<QueueOptions>): Queue {
    // BullMQ doesn't allow colons in queue names, use dash instead
    const prefixedQueueName = this.queueNamePrefix
      ? `${this.queueNamePrefix}-${queueName}`
      : queueName

    if (this.queues.has(prefixedQueueName)) {
      return this.queues.get(prefixedQueueName)!
    }

    const connection = createBullMqConnectionFromRedisClient(this.redisClient, this.redisUrl)

    const queue = new Queue(prefixedQueueName, {
      connection,
      ...options,
    })

    this.queues.set(prefixedQueueName, queue)

    this.logger.log(`Queue '${prefixedQueueName}' created`)

    return queue
  }

  /**
   * Add a job to a queue
   */
  async addJob<T = any>(
    queueName: string,
    jobName: string,
    data: T,
    options?: {
      delay?: number
      attempts?: number
      backoff?: { type: string; delay: number }
      priority?: number
      jobId?: string
    }
  ): Promise<void> {
    const queue = this.getQueue(queueName)

    await queue.add(jobName, data, {
      delay: options?.delay,
      attempts: options?.attempts,
      backoff: options?.backoff,
      priority: options?.priority,
      jobId: options?.jobId,
    })

    this.logger.debug(`Job '${jobName}' added to queue '${queueName}'`)
  }

  /**
   * Close all queues gracefully
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log(`Closing ${this.queues.size} queues...`)

    await Promise.all(
      Array.from(this.queues.values()).map(async (queue) => {
        await queue.close()
      })
    )

    this.queues.clear()
    this.logger.log('✅ All queues closed gracefully')
  }
}

