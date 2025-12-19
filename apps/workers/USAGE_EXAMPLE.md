# Usage Example: Producer → Consumer

This document shows how to use the BullMQ Producer in your API to send jobs to the Workers application.

## Setup Producer in API

### 1. Import BullMqProducerModule in your API module

```typescript
// apps/my-api/src/app/app.module.ts
import { BullMqProducerModule } from '@js-monorepo/bull-mq-transport'

@Module({
  imports: [
    // ... other imports
    BullMqProducerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        queueNamePrefix: configService.get('BULLMQ_QUEUE_PREFIX') || 'workers',
        redisUrl: configService.get('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 2. Use Producer Service in your services

```typescript
// apps/my-api/src/app/modules/email/email.service.ts
import { Injectable } from '@nestjs/common'
import { BullMqProducerService } from '@js-monorepo/bull-mq-transport'
import { EmailJobData } from '@js-monorepo/bull-mq-transport'

@Injectable()
export class EmailService {
  constructor(private readonly producerService: BullMqProducerService) {}

  async sendWelcomeEmail(userEmail: string, userName: string) {
    const emailData: EmailJobData = {
      to: userEmail,
      subject: 'Welcome!',
      body: `Hello ${userName}, welcome to our platform!`,
      template: 'welcome',
    }

    await this.producerService.addJob('emails', 'send-email', emailData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    })
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string) {
    const emailData: EmailJobData = {
      to: userEmail,
      subject: 'Password Reset',
      body: `Click here to reset your password: ${resetToken}`,
      template: 'password-reset',
    }

    await this.producerService.addJob('emails', 'send-email', emailData, {
      priority: 10, // Higher priority
      attempts: 2,
    })
  }
}
```

### 3. Use Producer Service in controllers

```typescript
// apps/my-api/src/app/modules/order/order.controller.ts
import { Controller, Post, Body } from '@nestjs/common'
import { BullMqProducerService } from '@js-monorepo/bull-mq-transport'
import { OrderJobData } from '@js-monorepo/bull-mq-transport'

@Controller('orders')
export class OrderController {
  constructor(private readonly producerService: BullMqProducerService) {}

  @Post()
  async createOrder(@Body() orderData: CreateOrderDto) {
    // Save order to database first
    const order = await this.orderService.create(orderData)

    // Then queue it for processing
    const jobData: OrderJobData = {
      orderId: order.id,
      userId: order.userId,
      items: order.items,
      total: order.total,
    }

    await this.producerService.addJob('orders', 'process-order', jobData, {
      delay: 1000, // Process after 1 second
      attempts: 3,
      priority: 5,
    })

    return { message: 'Order created and queued for processing', orderId: order.id }
  }
}
```

## Queue Names

Make sure the queue names match between producer and consumer:

**Producer (API):**
```typescript
await producerService.addJob('emails', 'send-email', data)
```

**Consumer (Workers):**
```typescript
consumerService.registerWorker('emails', processor)
```

Both will use the queue: `workers-emails` (with prefix `workers`, using dash separator)

## Job Options

### Delay
Process job after a delay:
```typescript
await producerService.addJob('emails', 'send-email', data, {
  delay: 5000, // 5 seconds
})
```

### Priority
Higher priority jobs are processed first:
```typescript
await producerService.addJob('emails', 'send-email', data, {
  priority: 10, // Higher = processed first
})
```

### Retries
Configure retry attempts:
```typescript
await producerService.addJob('emails', 'send-email', data, {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000, // Start with 2 seconds
  },
})
```

### Custom Job ID
Set a custom job ID:
```typescript
await producerService.addJob('emails', 'send-email', data, {
  jobId: `email-${userId}-${Date.now()}`,
})
```

## Testing

### Test Producer Locally

1. Start Redis:
```bash
docker run -d -p 6379:6379 redis:latest
```

2. Start Workers app:
```bash
npm run dev:workers
```

3. Start API app:
```bash
npm run dev:my-api
```

4. Make API calls that trigger job creation

5. Watch workers logs to see jobs being processed

### Monitor Queues

Use BullMQ Board or Redis CLI to monitor queues:

```bash
# Check queue length (BullMQ uses dash separator in queue names)
redis-cli LLEN bull:workers-emails:wait

# List all BullMQ keys
redis-cli KEYS "bull:workers-*"
```

## Best Practices

1. **Always save to database first**, then queue for async processing
2. **Use appropriate priorities** for time-sensitive jobs
3. **Set reasonable retry limits** to avoid infinite retries
4. **Monitor queue sizes** to prevent memory issues
5. **Use job IDs** for idempotency when needed
6. **Handle errors gracefully** in processors

