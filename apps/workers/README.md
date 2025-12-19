# Workers Microservice

A NestJS microservice that processes jobs from BullMQ queues.

## Overview

This microservice consumes jobs from BullMQ queues and processes them using registered worker processors. It runs as a NestJS microservice (TCP transport) and is designed to be horizontally scalable.

## Features

- ✅ Processes jobs from BullMQ queues
- ✅ Uses shared Redis connection from RedisModule
- ✅ Graceful shutdown handling
- ✅ Multiple worker processors support
- ✅ Configurable concurrency and rate limiting
- ✅ Comprehensive logging

## Architecture

```
┌─────────────────┐
│  Producer App   │  ──►  Adds jobs to queues
│  (my-api)       │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Redis/BullMQ  │  ──►  Queue storage
└─────────────────┘
         │
         ▼
┌─────────────────────┐
│  Workers Microservice│  ──►  Processes jobs
│  TCP:3001          │  ──►  Health checks
│  (this app)        │
└─────────────────────┘
```

### Microservice Features

- **TCP Transport**: Listens on configurable host/port for microservice communication
- **Health Check**: Responds to `{ cmd: 'health' }` and `{ cmd: 'ping' }` messages
- **Event Patterns**: Can receive events via `workers.health.check` pattern
- **BullMQ Processing**: Processes jobs from BullMQ queues independently

## Setup

### Prerequisites

Install required dependencies:

```bash
npm install @nestjs/microservices
```

### Environment Variables

Create a `.env` file or set the following environment variables:

```bash
REDIS_URL=redis://localhost:6379
BULLMQ_QUEUE_PREFIX=workers
WORKERS_HOST=0.0.0.0
WORKERS_PORT=3001
GRACEFUL_SHUTDOWN_TIMEOUT=10000
```

### Running the Application

**Development:**
```bash
npm run dev:workers
# or
nx serve workers
```

**Production:**
```bash
npm run build:workers
npm run start:workers
# or
nx build workers --prod
nx serve workers --prod
```

## Adding New Processors

1. Create a new processor file in `src/processors/`:

```typescript
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { BullMqConsumerService } from '@js-monorepo/bull-mq-transport'

export interface MyJobData {
  // Define your job data structure
}

@Injectable()
export class MyProcessor implements OnModuleInit {
  private readonly logger = new Logger(MyProcessor.name)

  constructor(private readonly consumerService: BullMqConsumerService) {}

  onModuleInit() {
    this.consumerService.registerWorker<MyJobData>(
      'my-queue', // Queue name (will be prefixed with BULLMQ_QUEUE_PREFIX)
      {
        process: async (job) => {
          // Your processing logic here
          await this.processJob(job.data)
        },
      },
      {
        concurrency: 5, // Number of concurrent jobs
        limiter: {
          max: 10, // Max jobs
          duration: 1000, // Per duration (ms)
        },
      }
    )
  }

  private async processJob(data: MyJobData): Promise<void> {
    // Implementation
  }
}
```

2. Register the processor in `workers.module.ts`:

```typescript
import { MyProcessor } from './processors/my.processor'

@Module({
  // ...
  providers: [EmailProcessor, OrderProcessor, MyProcessor],
})
export class WorkersModule {}
```

## Example Processors

### Email Processor

Processes email jobs from the `emails` queue.

**Job Data Structure:**
```typescript
{
  to: string
  subject: string
  body: string
  template?: string
}
```

### Order Processor

Processes order jobs from the `orders` queue.

**Job Data Structure:**
```typescript
{
  orderId: string
  userId: string
  items: Array<{ productId: string; quantity: number; price: number }>
  total: number
}
```

## Queue Naming

Queues are automatically prefixed with the `BULLMQ_QUEUE_PREFIX` environment variable (default: `workers`).

Example:
- Queue name: `emails`
- Actual queue: `workers-emails` (uses dash separator, BullMQ doesn't allow colons)

Make sure your producer uses the same prefix!

## Scaling

You can run multiple instances of the workers application to scale horizontally:

```bash
# Terminal 1
npm run dev:workers

# Terminal 2
npm run dev:workers

# Terminal 3
npm run dev:workers
```

BullMQ will automatically distribute jobs across all worker instances.

## Monitoring

- Check Redis for queue statistics
- Monitor application logs for job processing status
- Use BullMQ Board or similar tools for queue visualization
- Health check via microservice: `{ cmd: 'health' }` or `{ cmd: 'ping' }`

### Testing Microservice Health

You can test the microservice health using a NestJS microservice client:

```typescript
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices'

const client = ClientProxyFactory.create({
  transport: Transport.TCP,
  options: {
    host: 'localhost',
    port: 3001,
  },
})

// Health check
const health = await client.send({ cmd: 'health' }, {}).toPromise()
console.log(health)

// Ping
const pong = await client.send({ cmd: 'ping' }, {}).toPromise()
console.log(pong)
```

## Graceful Shutdown

The application handles graceful shutdown:
- Waits for in-progress jobs to complete
- Closes all workers gracefully
- Closes Redis connections
- Default timeout: 10 seconds (configurable via `GRACEFUL_SHUTDOWN_TIMEOUT`)

## Troubleshooting

### Jobs not processing

1. Check Redis connection: `REDIS_URL` is correct
2. Verify queue prefix matches producer
3. Check worker logs for errors
4. Ensure processor is registered in `WorkersModule`

### High memory usage

- Reduce `concurrency` in worker options
- Implement job data size limits
- Monitor queue sizes

### Jobs failing

- Check error logs
- Verify job data structure matches processor expectations
- Implement retry logic in processor if needed

## Development

```bash
# Run in development mode with watch
nx serve workers

# Build for production
nx build workers --prod

# Run tests
nx test workers

# Lint
nx lint workers
```

