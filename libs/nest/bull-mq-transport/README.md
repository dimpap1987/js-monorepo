# BullMQ Transport

A NestJS module for BullMQ that integrates with your existing Redis connection from `RedisModule`. This library provides separate modules for producing and consuming events/jobs using BullMQ.

## Installation

```bash
npm install bullmq
```

**Note:** BullMQ uses `ioredis` internally. The module will automatically extract the Redis URL from your `RedisModule` configuration or `ConfigService` to create the appropriate connection for BullMQ.

## Features

- ✅ Uses existing Redis connection from `RedisModule`
- ✅ Separate Consumer and Producer modules
- ✅ Type-safe job processing
- ✅ Graceful shutdown handling
- ✅ Queue name prefixing support
- ✅ Works with node-redis v4

## Usage

### 1. Setup Redis Module (if not already done)

```typescript
import { RedisModule } from '@js-monorepo/nest/redis/redis'

@Module({
  imports: [
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        url: configService.get('REDIS_URL'),
      }),
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
```

### 2. Producer Module

The Producer Module allows you to add jobs to queues.

```typescript
import { BullMqProducerModule } from '@js-monorepo/bull-mq-transport'

@Module({
  imports: [
    BullMqProducerModule.forRootAsync({
      useFactory: () => ({
        queueNamePrefix: 'my-app', // Optional, defaults to 'bullmq'
      }),
    }),
  ],
})
export class MyModule {}
```

#### Using the Producer Service

```typescript
import { Injectable } from '@nestjs/common'
import { BullMqProducerService } from '@js-monorepo/bull-mq-transport'

@Injectable()
export class MyService {
  constructor(private readonly producerService: BullMqProducerService) {}

  async sendEmail(data: { to: string; subject: string; body: string }) {
    await this.producerService.addJob('emails', 'send-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    })
  }

  async processOrder(orderId: string) {
    await this.producerService.addJob('orders', 'process-order', { orderId }, {
      delay: 5000, // Process after 5 seconds
      priority: 10, // Higher priority
    })
  }
}
```

### 3. Consumer Module

The Consumer Module allows you to process jobs from queues.

```typescript
import { BullMqConsumerModule } from '@js-monorepo/bull-mq-transport'

@Module({
  imports: [
    BullMqConsumerModule.forRootAsync({
      useFactory: () => ({
        queueNamePrefix: 'my-app', // Must match producer prefix
      }),
    }),
  ],
})
export class MyWorkerModule {}
```

#### Using the Consumer Service

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common'
import { BullMqConsumerService, JobProcessor } from '@js-monorepo/bull-mq-transport'

interface EmailJobData {
  to: string
  subject: string
  body: string
}

@Injectable()
export class EmailProcessor implements OnModuleInit {
  constructor(private readonly consumerService: BullMqConsumerService) {}

  onModuleInit() {
    // Register worker for email queue
    this.consumerService.registerWorker<EmailJobData>(
      'emails',
      {
        process: async (job) => {
          console.log(`Sending email to ${job.data.to}`)
          // Your email sending logic here
          await this.sendEmail(job.data)
        },
      },
      {
        concurrency: 5, // Process 5 jobs concurrently
      }
    )

    // Register worker for order processing
    this.consumerService.registerWorker(
      'orders',
      {
        process: async (job) => {
          console.log(`Processing order ${job.data.orderId}`)
          // Your order processing logic here
        },
      }
    )
  }

  private async sendEmail(data: EmailJobData) {
    // Email sending implementation
  }
}
```

## Complete Example

### app.module.ts

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RedisModule } from '@js-monorepo/nest/redis/redis'
import { BullMqProducerModule } from '@js-monorepo/bull-mq-transport'

@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        url: configService.get('REDIS_URL'),
      }),
      isGlobal: true,
    }),
    BullMqProducerModule.forRootAsync({
      useFactory: () => ({
        queueNamePrefix: 'my-app',
      }),
    }),
  ],
})
export class AppModule {}
```

### worker.module.ts (Separate worker application)

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RedisModule } from '@js-monorepo/nest/redis/redis'
import { BullMqConsumerModule } from '@js-monorepo/bull-mq-transport'
import { EmailProcessor } from './processors/email.processor'

@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        url: configService.get('REDIS_URL'),
      }),
      isGlobal: true,
    }),
    BullMqConsumerModule.forRootAsync({
      useFactory: () => ({
        queueNamePrefix: 'my-app', // Must match producer
      }),
    }),
  ],
  providers: [EmailProcessor],
})
export class WorkerModule {}
```

## API Reference

### BullMqProducerService

#### `addJob<T>(queueName: string, jobName: string, data: T, options?: JobOptions): Promise<void>`

Adds a job to a queue.

**Parameters:**
- `queueName`: Name of the queue
- `jobName`: Name/type of the job
- `data`: Job data
- `options`: Optional job options
  - `delay`: Delay in milliseconds before processing
  - `attempts`: Number of retry attempts
  - `backoff`: Backoff strategy
  - `priority`: Job priority (higher = processed first)
  - `jobId`: Custom job ID

#### `getQueue(queueName: string, options?: Partial<QueueOptions>): Queue`

Gets or creates a queue instance.

### BullMqConsumerService

#### `registerWorker<T>(queueName: string, processor: JobProcessor<T>, options?: Partial<WorkerOptions>): Worker`

Registers a worker to process jobs from a queue.

**Parameters:**
- `queueName`: Name of the queue to listen to
- `processor`: Object with `process` method
- `options`: Optional worker options (concurrency, etc.)

## Notes

- Both modules automatically use the shared Redis connection from `RedisModule`
- Queue names are automatically prefixed if `queueNamePrefix` is provided
- Queue names use dash (`-`) separator (e.g., `workers-emails`) because BullMQ doesn't allow colons in queue names
- All queues and workers are gracefully closed on application shutdown
- Make sure the `queueNamePrefix` matches between producer and consumer modules

## Queue Naming Convention

Queue names are constructed as: `{prefix}-{queueName}`

Example:
- Prefix: `workers`
- Queue name: `emails`
- Final queue name: `workers-emails`

**Important:** BullMQ doesn't allow colons (`:`) in queue names, so we use dashes (`-`) as separators.

## License

MIT

