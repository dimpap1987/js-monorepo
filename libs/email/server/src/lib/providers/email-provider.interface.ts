import { SendEmailOptions, SendEmailResult } from '../email.types'

export abstract class EmailProvider {
  abstract send(options: SendEmailOptions): Promise<SendEmailResult>
  abstract validateConfig(): void
}
