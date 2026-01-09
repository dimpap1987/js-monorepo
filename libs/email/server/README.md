# Email Server Library

A configurable, provider-agnostic email library for NestJS applications.

## Features

- **Multiple Providers**: SMTP (nodemailer), SendGrid, Console (development)
- **Template System**: Built-in template engine with `{{variable}}` syntax
- **Retry Logic**: Configurable retry attempts with exponential backoff
- **Lifecycle Hooks**: `onEmailSent` and `onEmailFailed` callbacks
- **Batch Sending**: Send multiple emails concurrently
- **Type-Safe**: Full TypeScript support

## Installation

The library is available via the workspace alias:

```typescript
import { EmailModule, EmailService } from '@js-monorepo/email-server'
```

## Configuration

### Basic Setup (forRoot)

```typescript
import { EmailModule } from '@js-monorepo/email-server'

@Module({
  imports: [
    EmailModule.forRoot({
      provider: 'smtp',
      defaultFrom: 'noreply@example.com',
      smtp: {
        host: 'smtp.example.com',
        port: 587,
        auth: {
          user: 'username',
          pass: 'password',
        },
      },
    }),
  ],
})
export class AppModule {}
```

### Async Configuration (forRootAsync)

```typescript
import { EmailModule } from '@js-monorepo/email-server'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    EmailModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        provider: configService.get('EMAIL_PROVIDER') as 'smtp' | 'sendgrid' | 'console',
        defaultFrom: {
          email: configService.get('EMAIL_FROM'),
          name: configService.get('EMAIL_FROM_NAME'),
        },
        smtp: {
          host: configService.get('SMTP_HOST'),
          port: parseInt(configService.get('SMTP_PORT')),
          secure: configService.get('SMTP_SECURE') === 'true',
          auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS'),
          },
        },
        sendgrid: {
          apiKey: configService.get('SENDGRID_API_KEY'),
        },
        debug: configService.get('NODE_ENV') !== 'production',
        retryAttempts: 3,
        retryDelay: 1000,
        onEmailSent: (result, options) => {
          console.log(`Email sent to ${options.to}: ${result.messageId}`)
        },
        onEmailFailed: (error, options) => {
          console.error(`Failed to send email to ${options.to}: ${error.message}`)
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Providers

### Console Provider (Development)

Logs emails to the console instead of sending them. Useful for development and testing.

```typescript
EmailModule.forRoot({
  provider: 'console',
  defaultFrom: 'dev@localhost',
})
```

### SMTP Provider

Uses nodemailer to send emails via SMTP.

```typescript
EmailModule.forRoot({
  provider: 'smtp',
  defaultFrom: 'noreply@example.com',
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-app-password',
    },
  },
})
```

### SendGrid Provider

Uses the SendGrid API to send emails.

```typescript
EmailModule.forRoot({
  provider: 'sendgrid',
  defaultFrom: 'noreply@example.com',
  sendgrid: {
    apiKey: 'SG.xxxxxxxxxxxx',
  },
})
```

## Usage

### Basic Email

```typescript
import { Injectable } from '@nestjs/common'
import { EmailService } from '@js-monorepo/email-server'

@Injectable()
export class NotificationService {
  constructor(private readonly emailService: EmailService) {}

  async sendWelcomeEmail(userEmail: string, userName: string) {
    const result = await this.emailService.send({
      to: userEmail,
      subject: `Welcome, ${userName}!`,
      html: `<h1>Welcome to our platform!</h1><p>Hi ${userName}, thanks for signing up.</p>`,
      text: `Welcome to our platform! Hi ${userName}, thanks for signing up.`,
    })

    if (result.success) {
      console.log(`Email sent: ${result.messageId}`)
    } else {
      console.error(`Email failed: ${result.error}`)
    }
  }
}
```

### With Attachments

```typescript
await this.emailService.send({
  to: 'user@example.com',
  subject: 'Your Invoice',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: pdfBuffer,
      contentType: 'application/pdf',
    },
  ],
})
```

### Multiple Recipients

```typescript
await this.emailService.send({
  to: ['user1@example.com', 'user2@example.com'],
  cc: [{ email: 'manager@example.com', name: 'Manager' }],
  bcc: 'admin@example.com',
  subject: 'Team Update',
  html: '<p>Important announcement...</p>',
})
```

### Batch Sending

```typescript
const emails = users.map((user) => ({
  to: user.email,
  subject: 'Monthly Newsletter',
  html: `<p>Hi ${user.name}, here's your newsletter...</p>`,
}))

const results = await this.emailService.sendBatch(emails)
const successful = results.filter((r) => r.success).length
console.log(`Sent ${successful}/${results.length} emails`)
```

## Templates

### Registering Templates

```typescript
@Injectable()
export class EmailSetupService implements OnModuleInit {
  constructor(private readonly emailService: EmailService) {}

  onModuleInit() {
    this.emailService.registerTemplates({
      'welcome': {
        subject: 'Welcome to {{appName}}, {{userName}}!',
        html: `
          <h1>Welcome, {{userName}}!</h1>
          <p>Thanks for joining {{appName}}.</p>
          <a href="{{dashboardUrl}}">Go to Dashboard</a>
        `,
        text: 'Welcome, {{userName}}! Thanks for joining {{appName}}.',
      },
      'password-reset': {
        subject: 'Reset your password',
        html: `
          <p>Hi {{userName}},</p>
          <p>Click the link below to reset your password:</p>
          <a href="{{resetUrl}}">Reset Password</a>
          <p>This link expires in {{expiresIn}} minutes.</p>
        `,
      },
      'order-confirmation': {
        subject: 'Order #{{orderId}} Confirmed',
        html: `
          <h1>Thank you for your order!</h1>
          <p>Order ID: {{orderId}}</p>
          <p>Total: ${{total}}</p>
        `,
      },
    })
  }
}
```

### Sending with Templates

```typescript
await this.emailService.sendWithTemplate('welcome', {
  to: user.email,
  templateData: {
    appName: 'MyApp',
    userName: user.name,
    dashboardUrl: 'https://myapp.com/dashboard',
  },
})

await this.emailService.sendWithTemplate('password-reset', {
  to: user.email,
  templateData: {
    userName: user.name,
    resetUrl: `https://myapp.com/reset?token=${token}`,
    expiresIn: 30,
  },
})
```

### Nested Template Variables

The template engine supports nested object access:

```typescript
this.emailService.registerTemplate('invoice', {
  subject: 'Invoice for {{customer.name}}',
  html: `
    <p>Dear {{customer.name}},</p>
    <p>Amount due: {{invoice.currency}}{{invoice.amount}}</p>
  `,
})

await this.emailService.sendWithTemplate('invoice', {
  to: 'customer@example.com',
  templateData: {
    customer: { name: 'John Doe' },
    invoice: { currency: '$', amount: '99.99' },
  },
})
```

## Custom Template Engine

You can use a custom template engine (e.g., Handlebars, EJS):

```typescript
import * as Handlebars from 'handlebars'
import { EmailModule } from '@js-monorepo/email-server'

const handlebarsEngine = {
  render: (template: string, data: Record<string, unknown>) => {
    return Handlebars.compile(template)(data)
  },
}

@Module({
  imports: [
    EmailModule.withTemplateEngine(
      {
        provider: 'smtp',
        defaultFrom: 'noreply@example.com',
        smtp: { host: 'localhost', port: 1025 },
      },
      handlebarsEngine
    ),
  ],
})
export class AppModule {}
```

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `provider` | `'smtp' \| 'sendgrid' \| 'console'` | Yes | Email provider to use |
| `defaultFrom` | `string \| EmailAddress` | Yes | Default sender address |
| `smtp` | `SmtpConfig` | If provider is 'smtp' | SMTP configuration |
| `sendgrid` | `SendGridConfig` | If provider is 'sendgrid' | SendGrid configuration |
| `debug` | `boolean` | No | Enable debug logging |
| `retryAttempts` | `number` | No | Number of retry attempts (default: 1) |
| `retryDelay` | `number` | No | Delay between retries in ms (default: 1000) |
| `onEmailSent` | `function` | No | Callback after successful send |
| `onEmailFailed` | `function` | No | Callback after all retries fail |

## Environment Variables Example

```bash
# .env
EMAIL_PROVIDER=smtp
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME=My App

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=username
SMTP_PASS=password

# SendGrid (alternative)
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
```

## Testing

Use the `console` provider in tests to avoid sending real emails:

```typescript
// test setup
const module = await Test.createTestingModule({
  imports: [
    EmailModule.forRoot({
      provider: 'console',
      defaultFrom: 'test@localhost',
    }),
  ],
}).compile()
```

Or mock the `EmailService`:

```typescript
const mockEmailService = {
  send: jest.fn().mockResolvedValue({ success: true, messageId: 'test-123' }),
  sendWithTemplate: jest.fn().mockResolvedValue({ success: true }),
}

const module = await Test.createTestingModule({
  providers: [
    { provide: EmailService, useValue: mockEmailService },
  ],
}).compile()
```
