import { DynamicModule, Global, Module, Provider } from '@nestjs/common'
import { PaymentsController } from './controller/payments.controller'
import { SubscriptionGuard } from './guards/subscription.guard'
import { PaymentsRepository } from './repository/payments.repository'
import { PaymentsService } from './service/payments.service'
import { StripeService } from './service/stripe.service'
import { StripeModule } from './stripe.module'

export interface SubscriptionCallback {
  id: number
  name: string
  cancelAt?: Date
}

export interface PaymentsModuleOptions {
  onSubscriptionCreateSuccess?: (userId: number, subscription: SubscriptionCallback) => void
  onSubscriptionUpdateSuccess?: (userId: number, subscription: SubscriptionCallback) => void
  onSubscriptionDeleteSuccess?: (userId: number, subscription: SubscriptionCallback) => void
  onSubscriptionEvent?: (userId: number, event: 'created' | 'updated' | 'deleted') => void
}

const providers: Provider[] = [StripeService, PaymentsRepository, PaymentsService, SubscriptionGuard]

@Global()
@Module({})
export class PaymentsModule {
  static forRootAsync(options: {
    useFactory?: (...args: any[]) => PaymentsModuleOptions | Promise<PaymentsModuleOptions>
    inject?: any[]
    imports?: any[]
  }): DynamicModule {
    return {
      global: true,
      module: PaymentsModule,
      imports: [
        ...(options.imports || []),
        StripeModule.forRoot({
          apiKey: process.env.STRIPE_SECRET_KEY || '',
          apiVersion: '2023-10-16',
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        }),
      ],
      providers: [
        {
          provide: 'PAYMENTS_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        ...providers,
      ],
      controllers: [PaymentsController],
      exports: [...providers, 'PAYMENTS_OPTIONS'],
    }
  }
}
