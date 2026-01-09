import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import { Transporter } from 'nodemailer'
import { EMAIL_MODULE_OPTIONS } from '../email.tokens'
import { EmailAddress, EmailModuleOptions, SendEmailOptions, SendEmailResult } from '../email.types'
import { EmailProvider } from './email-provider.interface'

@Injectable()
export class SmtpEmailProvider extends EmailProvider implements OnModuleDestroy {
  private readonly logger = new Logger(SmtpEmailProvider.name)
  private transporter: Transporter | null = null

  constructor(
    @Inject(EMAIL_MODULE_OPTIONS)
    private readonly options: EmailModuleOptions
  ) {
    super()
  }

  validateConfig(): void {
    if (!this.options.smtp) {
      throw new Error('SMTP configuration is required when using SMTP provider')
    }

    if (!this.options.smtp.host) {
      throw new Error('SMTP host is required')
    }

    if (!this.options.smtp.port) {
      throw new Error('SMTP port is required')
    }
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.validateConfig()

      this.transporter = nodemailer.createTransport({
        host: this.options.smtp!.host,
        port: this.options.smtp!.port,
        secure: this.options.smtp!.secure ?? this.options.smtp!.port === 465,
        auth: this.options.smtp!.auth,
        tls: this.options.smtp!.tls,
      })
    }

    return this.transporter
  }

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const transporter = this.getTransporter()

    const mailOptions = {
      from: this.formatEmailAddress(options.from ?? this.options.defaultFrom),
      to: this.formatRecipients(options.to),
      cc: options.cc ? this.formatRecipients(options.cc) : undefined,
      bcc: options.bcc ? this.formatRecipients(options.bcc) : undefined,
      replyTo: options.replyTo ? this.formatEmailAddress(options.replyTo) : undefined,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
        encoding: attachment.encoding,
      })),
      headers: options.headers,
    }

    if (this.options.debug) {
      this.logger.debug(`Sending email via SMTP: ${JSON.stringify(mailOptions, null, 2)}`)
    }

    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId,
      provider: 'smtp',
      timestamp: new Date(),
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.transporter) {
      this.transporter.close()
      this.transporter = null
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
    return address.name ? `"${address.name}" <${address.email}>` : address.email
  }
}
