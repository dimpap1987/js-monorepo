import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { Worker, WorkerOptions } from 'bullmq'
import { RedisClientType } from 'redis'
import { createBullMqConnectionFromRedisClient } from '../shared/utils/redis-adapter.util'

export interface JobProcessor<T = any> {
  process(job: { id: string; name: string; data: T }): Promise<void> | void
}

@Injectable()
export class BullMqConsumerService implements OnModuleDestroy {
  private readonly logger = new Logger(BullMqConsumerService.name)
  private readonly workers = new Map<string, Worker>()

  constructor(
    private readonly redisClient: RedisClientType,
    private readonly queueNamePrefix?: string,
    private readonly redisUrl?: string
  ) {}

  /**
   * Register a worker to process jobs from a queue
   */
  registerWorker<T = any>(queueName: string, processor: JobProcessor<T>, options?: Partial<WorkerOptions>): Worker {
    // BullMQ doesn't allow colons in queue names, use dash instead
    const prefixedQueueName = this.queueNamePrefix ? `${this.queueNamePrefix}-${queueName}` : queueName

    if (this.workers.has(prefixedQueueName)) {
      this.logger.warn(`Worker for queue '${prefixedQueueName}' already exists`)
      return this.workers.get(prefixedQueueName)!
    }

    const connection = createBullMqConnectionFromRedisClient(this.redisClient, this.redisUrl)

    const worker = new Worker(
      prefixedQueueName,
      async (job) => {
        this.logger.debug(`Processing job '${job.name}' (${job.id}) from queue '${prefixedQueueName}'`)
        await processor.process({
          id: job.id!,
          name: job.name,
          data: job.data as T,
        })
      },
      {
        connection,
        ...options,
      }
    )

    worker.on('completed', (job) => {
      this.logger.debug(`Job '${job.name}' (${job.id}) completed`)
    })

    worker.on('failed', (job, err) => {
      this.logger.error(`Job '${job?.name}' (${job?.id}) failed: ${err.message}`, err.stack)
    })

    worker.on('error', (err) => {
      this.logger.error(`Worker error for queue '${prefixedQueueName}': ${err.message}`, err.stack)
    })

    this.workers.set(prefixedQueueName, worker)
    this.logger.log(`Worker registered for queue '${prefixedQueueName}'`)

    return worker
  }

  /**
   * Close all workers gracefully
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log(`Closing ${this.workers.size} workers...`)

    await Promise.all(
      Array.from(this.workers.values()).map(async (worker) => {
        await worker.close()
      })
    )

    this.workers.clear()
    this.logger.log('✅ All workers closed gracefully')
  }
}
