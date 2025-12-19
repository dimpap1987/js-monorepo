import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { BullMqConsumerService, JobProcessor } from '@js-monorepo/bull-mq-transport'

export interface EmailJobData {
  to: string
  subject: string
  body: string
  template?: string
}

@Injectable()
export class EmailProcessor implements OnModuleInit {
  private readonly logger = new Logger(EmailProcessor.name)

  constructor(private readonly consumerService: BullMqConsumerService) {}

  onModuleInit() {
    this.logger.log('Registering email worker...')

    // Register worker for email queue
    this.consumerService.registerWorker<EmailJobData>(
      'emails',
      {
        process: async (job) => {
          this.logger.log(`Processing email job: ${job.name} (${job.id})`)
          this.logger.debug(`Email data:`, job.data)

          try {
            await this.sendEmail(job.data)
            this.logger.log(`✅ Email sent successfully to ${job.data.to}`)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            const errorStack = error instanceof Error ? error.stack : undefined
            this.logger.error(`Failed to send email: ${errorMessage}`, errorStack)
            throw error // Re-throw to mark job as failed
          }
        },
      },
      {
        concurrency: 5, // Process 5 emails concurrently
        limiter: {
          max: 10, // Max 10 jobs
          duration: 1000, // Per 1 second
        },
      }
    )

    this.logger.log('✅ Email worker registered')
  }

  private async sendEmail(data: EmailJobData): Promise<void> {
    // Simulate email sending
    this.logger.log(`Sending email to ${data.to} with subject: ${data.subject}`)

    // TODO: Implement actual email sending logic
    // Example: await this.emailService.send(data)

    // Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

