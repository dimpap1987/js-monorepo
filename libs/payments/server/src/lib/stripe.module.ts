import { DynamicModule, Module } from '@nestjs/common'
import { PaymentsClient, StripeProvider } from '@super-dp/payments-core'

export interface StripeModuleOptions {
  apiKey: string
  apiVersion?: string
  webhookSecret?: string
}

export const PaymentsClientToken = Symbol('PAYMENTS_CLIENT')

@Module({})
export class StripeModule {
  static forRoot(options: StripeModuleOptions): DynamicModule {
    const stripeProvider = new StripeProvider({
      apiKey: options.apiKey,
      apiVersion: options.apiVersion as any,
      webhookSecret: options.webhookSecret,
    })

    const paymentsClient = new PaymentsClient(stripeProvider)

    const paymentsClientProvider = {
      provide: PaymentsClientToken,
      useValue: paymentsClient,
    }

    return {
      module: StripeModule,
      providers: [paymentsClientProvider],
      exports: [paymentsClientProvider],
    }
  }
}
