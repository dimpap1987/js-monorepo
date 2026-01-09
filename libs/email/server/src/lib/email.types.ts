export type EmailProviderType = 'smtp' | 'sendgrid' | 'console'

export interface EmailAddress {
  email: string
  name?: string
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType?: string
  encoding?: 'base64' | 'binary' | 'utf-8'
}

export interface SendEmailOptions {
  to: string | string[] | EmailAddress | EmailAddress[]
  subject: string
  text?: string
  html?: string
  from?: string | EmailAddress
  replyTo?: string | EmailAddress
  cc?: string | string[] | EmailAddress | EmailAddress[]
  bcc?: string | string[] | EmailAddress | EmailAddress[]
  attachments?: EmailAttachment[]
  templateId?: string
  templateData?: Record<string, unknown>
  headers?: Record<string, string>
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  provider: EmailProviderType
  timestamp: Date
  error?: string
}

export interface SmtpConfig {
  host: string
  port: number
  secure?: boolean
  auth?: {
    user: string
    pass: string
  }
  tls?: {
    rejectUnauthorized?: boolean
  }
}

export interface SendGridConfig {
  apiKey: string
}

export interface EmailModuleOptions {
  provider: EmailProviderType
  defaultFrom: string | EmailAddress
  smtp?: SmtpConfig
  sendgrid?: SendGridConfig
  debug?: boolean
  retryAttempts?: number
  retryDelay?: number
  onEmailSent?: (result: SendEmailResult, options: SendEmailOptions) => void | Promise<void>
  onEmailFailed?: (error: Error, options: SendEmailOptions) => void | Promise<void>
}

export interface EmailModuleAsyncOptions {
  imports?: any[]
  inject?: any[]
  useFactory: (...args: any[]) => EmailModuleOptions | Promise<EmailModuleOptions>
}
