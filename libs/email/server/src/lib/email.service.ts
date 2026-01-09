import { Inject, Injectable, Logger } from '@nestjs/common'
import { EMAIL_MODULE_OPTIONS, EMAIL_PROVIDER } from './email.tokens'
import { EmailModuleOptions, SendEmailOptions, SendEmailResult } from './email.types'
import { EmailProvider } from './providers'
import { EmailTemplateService } from './templates'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(
    @Inject(EMAIL_MODULE_OPTIONS)
    private readonly options: EmailModuleOptions,
    @Inject(EMAIL_PROVIDER)
    private readonly provider: EmailProvider,
    private readonly templateService: EmailTemplateService
  ) {}

  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    const emailOptions = await this.prepareEmailOptions(options)
    const maxAttempts = this.options.retryAttempts ?? 1
    const retryDelay = this.options.retryDelay ?? 1000

    let lastError: Error | undefined
    let attempt = 0

    while (attempt < maxAttempts) {
      attempt++

      try {
        if (this.options.debug) {
          this.logger.debug(`Sending email (attempt ${attempt}/${maxAttempts})`)
        }

        const result = await this.provider.send(emailOptions)

        if (this.options.onEmailSent) {
          try {
            await this.options.onEmailSent(result, emailOptions)
          } catch (callbackError) {
            this.logger.warn(`onEmailSent callback error: ${callbackError}`)
          }
        }

        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        this.logger.warn(`Email send attempt ${attempt}/${maxAttempts} failed: ${lastError.message}`)

        if (attempt < maxAttempts) {
          await this.delay(retryDelay * attempt)
        }
      }
    }

    if (this.options.onEmailFailed && lastError) {
      try {
        await this.options.onEmailFailed(lastError, emailOptions)
      } catch (callbackError) {
        this.logger.warn(`onEmailFailed callback error: ${callbackError}`)
      }
    }

    return {
      success: false,
      provider: this.options.provider,
      timestamp: new Date(),
      error: lastError?.message ?? 'Unknown error',
    }
  }

  async sendBatch(emails: SendEmailOptions[]): Promise<SendEmailResult[]> {
    return Promise.all(emails.map((email) => this.send(email)))
  }

  async sendWithTemplate(
    templateId: string,
    options: Omit<SendEmailOptions, 'subject' | 'html' | 'text'> & {
      templateData?: Record<string, unknown>
    }
  ): Promise<SendEmailResult> {
    const template = this.templateService.render(templateId, options.templateData ?? {})

    return this.send({
      ...options,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  registerTemplate(templateId: string, template: { subject: string; html?: string; text?: string }): void {
    this.templateService.registerTemplate(templateId, template)
  }

  registerTemplates(templates: Record<string, { subject: string; html?: string; text?: string }>): void {
    this.templateService.registerTemplates(templates)
  }

  private async prepareEmailOptions(options: SendEmailOptions): Promise<SendEmailOptions> {
    const prepared: SendEmailOptions = {
      ...options,
      from: options.from ?? this.options.defaultFrom,
    }

    if (options.templateId && this.templateService.hasTemplate(options.templateId)) {
      const template = this.templateService.render(options.templateId, options.templateData ?? {})
      prepared.subject = prepared.subject ?? template.subject
      prepared.html = prepared.html ?? template.html
      prepared.text = prepared.text ?? template.text
    }

    return prepared
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
