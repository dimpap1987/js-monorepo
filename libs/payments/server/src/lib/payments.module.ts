import { DynamicModule, Global, Module, Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AdminProductsController } from './controller/admin-products.controller'
import { InvoiceController } from './controller/invoice.controller'
import { PaymentsController } from './controller/payments.controller'
import { ReconciliationController } from './controller/reconciliation.controller'
import { TrialController } from './controller/trial.controller'
import { SubscriptionGuard } from './guards/subscription.guard'
import { PaymentsRepository } from './repository/payments.repository'
import { AdminProductsService } from './service/admin-products.service'
import { PaymentsService } from './service/payments.service'
import { ReconciliationService } from './service/reconciliation.service'
import { StripeService } from './service/stripe.service'
import { TrialService } from './service/trial.service'
import { TrialExpiryScheduler } from './service/trial-expiry.scheduler'
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
  onSubscriptionRenewSuccess?: (userId: number, subscription: SubscriptionCallback) => void
  onSubscriptionExpiredSuccess?: (userId: number, subscription: SubscriptionCallback) => void
  onSubscriptionEvent?: (userId: number, event: 'created' | 'updated' | 'deleted') => void
  onTrialStarted?: (userId: number, subscription: SubscriptionCallback) => void
  onTrialExpired?: (userId: number, subscription: SubscriptionCallback) => void
}

const providers: Provider[] = [
  StripeService,
  PaymentsRepository,
  PaymentsService,
  SubscriptionGuard,
  TrialService,
  TrialExpiryScheduler,
  AdminProductsService,
  ReconciliationService,
]

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
        StripeModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
            apiKey: configService.get<string>('STRIPE_SECRET_KEY') || '',
            apiVersion: '2023-10-16',
            webhookSecret: configService.get<string>('STRIPE_WEBHOOK_SECRET'),
          }),
          inject: [ConfigService],
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
      controllers: [
        PaymentsController,
        InvoiceController,
        TrialController,
        AdminProductsController,
        ReconciliationController,
      ],
      exports: [...providers, 'PAYMENTS_OPTIONS'],
    }
  }
}
