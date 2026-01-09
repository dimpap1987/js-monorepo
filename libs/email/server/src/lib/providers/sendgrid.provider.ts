import { Inject, Injectable, Logger } from '@nestjs/common'
import { EMAIL_MODULE_OPTIONS } from '../email.tokens'
import { EmailAddress, EmailModuleOptions, SendEmailOptions, SendEmailResult } from '../email.types'
import { EmailProvider } from './email-provider.interface'

interface SendGridPersonalization {
  to: Array<{ email: string; name?: string }>
  cc?: Array<{ email: string; name?: string }>
  bcc?: Array<{ email: string; name?: string }>
  dynamic_template_data?: Record<string, unknown>
}

interface SendGridMailData {
  personalizations: SendGridPersonalization[]
  from: { email: string; name?: string }
  reply_to?: { email: string; name?: string }
  subject?: string
  content?: Array<{ type: string; value: string }>
  template_id?: string
  attachments?: Array<{
    content: string
    filename: string
    type?: string
    disposition?: string
  }>
  headers?: Record<string, string>
  categories?: string[]
  custom_args?: Record<string, string>
}

@Injectable()
export class SendGridEmailProvider extends EmailProvider {
  private readonly logger = new Logger(SendGridEmailProvider.name)
  private readonly apiUrl = 'https://api.sendgrid.com/v3/mail/send'

  constructor(
    @Inject(EMAIL_MODULE_OPTIONS)
    private readonly options: EmailModuleOptions
  ) {
    super()
  }

  validateConfig(): void {
    if (!this.options.sendgrid) {
      throw new Error('SendGrid configuration is required when using SendGrid provider')
    }

    if (!this.options.sendgrid.apiKey) {
      throw new Error('SendGrid API key is required')
    }
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    this.validateConfig()

    const mailData = this.buildMailData(options)

    if (this.options.debug) {
      this.logger.debug(`Sending email via SendGrid: ${JSON.stringify(mailData, null, 2)}`)
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.options.sendgrid!.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailData),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`SendGrid API error: ${response.status} - ${errorBody}`)
    }

    const messageId = response.headers.get('x-message-id') ?? `sendgrid-${Date.now()}`

    return {
      success: true,
      messageId,
      provider: 'sendgrid',
      timestamp: new Date(),
    }
  }

  private buildMailData(options: SendEmailOptions): SendGridMailData {
    const from = this.toSendGridAddress(options.from ?? this.options.defaultFrom)
    const personalization: SendGridPersonalization = {
      to: this.toSendGridAddresses(options.to),
    }

    if (options.cc) {
      personalization.cc = this.toSendGridAddresses(options.cc)
    }

    if (options.bcc) {
      personalization.bcc = this.toSendGridAddresses(options.bcc)
    }

    if (options.templateData) {
      personalization.dynamic_template_data = options.templateData
    }

    const mailData: SendGridMailData = {
      personalizations: [personalization],
      from,
    }

    if (options.replyTo) {
      mailData.reply_to = this.toSendGridAddress(options.replyTo)
    }

    if (options.templateId) {
      mailData.template_id = options.templateId
    } else {
      mailData.subject = options.subject
      mailData.content = []

      if (options.text) {
        mailData.content.push({ type: 'text/plain', value: options.text })
      }

      if (options.html) {
        mailData.content.push({ type: 'text/html', value: options.html })
      }
    }

    if (options.attachments?.length) {
      mailData.attachments = options.attachments.map((attachment) => ({
        content: typeof attachment.content === 'string' ? attachment.content : attachment.content.toString('base64'),
        filename: attachment.filename,
        type: attachment.contentType,
        disposition: 'attachment',
      }))
    }

    if (options.headers) {
      mailData.headers = options.headers
    }

    if (options.tags?.length) {
      mailData.categories = options.tags
    }

    if (options.metadata) {
      mailData.custom_args = Object.fromEntries(
        Object.entries(options.metadata).map(([key, value]) => [key, String(value)])
      )
    }

    return mailData
  }

  private toSendGridAddresses(
    addresses: string | string[] | EmailAddress | EmailAddress[]
  ): Array<{ email: string; name?: string }> {
    if (typeof addresses === 'string') {
      return [{ email: addresses }]
    }

    if (Array.isArray(addresses)) {
      return addresses.map((addr) => this.toSendGridAddress(addr))
    }

    return [this.toSendGridAddress(addresses)]
  }

  private toSendGridAddress(address: string | EmailAddress): { email: string; name?: string } {
    if (typeof address === 'string') {
      return { email: address }
    }
    return { email: address.email, name: address.name }
  }
}
