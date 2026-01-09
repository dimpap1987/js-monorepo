import { Injectable, Logger } from '@nestjs/common'
import { EmailAddress, SendEmailOptions, SendEmailResult } from '../email.types'
import { EmailProvider } from './email-provider.interface'

@Injectable()
export class ConsoleEmailProvider extends EmailProvider {
  private readonly logger = new Logger(ConsoleEmailProvider.name)

  validateConfig(): void {
    // No configuration needed for console provider
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const messageId = `console-${Date.now()}-${Math.random().toString(36).substring(7)}`

    this.logger.log('━'.repeat(60))
    this.logger.log('📧 EMAIL (Console Provider - Development Mode)')
    this.logger.log('━'.repeat(60))
    this.logger.log(`Message ID: ${messageId}`)
    this.logger.log(`To: ${this.formatRecipients(options.to)}`)

    if (options.cc) {
      this.logger.log(`CC: ${this.formatRecipients(options.cc)}`)
    }

    if (options.bcc) {
      this.logger.log(`BCC: ${this.formatRecipients(options.bcc)}`)
    }

    if (options.from) {
      this.logger.log(`From: ${this.formatEmailAddress(options.from)}`)
    }

    if (options.replyTo) {
      this.logger.log(`Reply-To: ${this.formatEmailAddress(options.replyTo)}`)
    }

    this.logger.log(`Subject: ${options.subject}`)

    if (options.templateId) {
      this.logger.log(`Template ID: ${options.templateId}`)
      if (options.templateData) {
        this.logger.log(`Template Data: ${JSON.stringify(options.templateData, null, 2)}`)
      }
    }

    if (options.text) {
      this.logger.log('─'.repeat(40))
      this.logger.log('Text Content:')
      this.logger.log(options.text)
    }

    if (options.html) {
      this.logger.log('─'.repeat(40))
      this.logger.log('HTML Content:')
      this.logger.log(options.html.substring(0, 500) + (options.html.length > 500 ? '...' : ''))
    }

    if (options.attachments?.length) {
      this.logger.log('─'.repeat(40))
      this.logger.log(`Attachments: ${options.attachments.map((a) => a.filename).join(', ')}`)
    }

    this.logger.log('━'.repeat(60))

    return {
      success: true,
      messageId,
      provider: 'console',
      timestamp: new Date(),
    }
  }

  private formatRecipients(recipients: string | string[] | EmailAddress | EmailAddress[]): string {
    if (typeof recipients === 'string') {
      return recipients
    }

    if (Array.isArray(recipients)) {
      return recipients.map((r) => this.formatEmailAddress(r)).join(', ')
    }

    return this.formatEmailAddress(recipients)
  }

  private formatEmailAddress(address: string | EmailAddress): string {
    if (typeof address === 'string') {
      return address
    }
    return address.name ? `${address.name} <${address.email}>` : address.email
  }
}
