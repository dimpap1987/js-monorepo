import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { BullMqConsumerService, JobProcessor } from '@js-monorepo/bull-mq-transport'

export interface OrderJobData {
  orderId: string
  userId: string
  items: Array<{ productId: string; quantity: number; price: number }>
  total: number
}

@Injectable()
export class OrderProcessor implements OnModuleInit {
  private readonly logger = new Logger(OrderProcessor.name)

  constructor(private readonly consumerService: BullMqConsumerService) {}

  onModuleInit() {
    this.logger.log('Registering order worker...')

    // Register worker for order processing queue
    this.consumerService.registerWorker<OrderJobData>(
      'orders',
      {
        process: async (job) => {
          this.logger.log(`Processing order job: ${job.name} (${job.id})`)
          this.logger.debug(`Order data:`, job.data)

          try {
            await this.processOrder(job.data)
            this.logger.log(`✅ Order ${job.data.orderId} processed successfully`)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            const errorStack = error instanceof Error ? error.stack : undefined
            this.logger.error(`Failed to process order: ${errorMessage}`, errorStack)
            throw error // Re-throw to mark job as failed
          }
        },
      },
      {
        concurrency: 3, // Process 3 orders concurrently
        limiter: {
          max: 20, // Max 20 jobs
          duration: 1000, // Per 1 second
        },
      }
    )

    this.logger.log('✅ Order worker registered')
  }

  private async processOrder(data: OrderJobData): Promise<void> {
    this.logger.log(`Processing order ${data.orderId} for user ${data.userId}`)

    // Step 1: Validate order
    this.logger.debug('Validating order...')
    await this.validateOrder(data)

    // Step 2: Process payment
    this.logger.debug('Processing payment...')
    await this.processPayment(data)

    // Step 3: Update inventory
    this.logger.debug('Updating inventory...')
    await this.updateInventory(data)

    // Step 4: Send confirmation
    this.logger.debug('Sending confirmation...')
    await this.sendConfirmation(data)

    this.logger.log(`Order ${data.orderId} processed successfully`)
  }

  private async validateOrder(data: OrderJobData): Promise<void> {
    // TODO: Implement order validation logic
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  private async processPayment(data: OrderJobData): Promise<void> {
    // TODO: Implement payment processing logic
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async updateInventory(data: OrderJobData): Promise<void> {
    // TODO: Implement inventory update logic
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  private async sendConfirmation(data: OrderJobData): Promise<void> {
    // TODO: Implement confirmation sending logic
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}
