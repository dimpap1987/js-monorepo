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

  static forRootAsync(options: {
    useFactory: (...args: any[]) => StripeModuleOptions | Promise<StripeModuleOptions>
    inject?: any[]
  }): DynamicModule {
    const paymentsClientProvider = {
      provide: PaymentsClientToken,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args)
        if (!config.apiKey) {
          throw new Error('Stripe API key is required')
        }
        const stripeProvider = new StripeProvider({
          apiKey: config.apiKey,
          apiVersion: config.apiVersion as any,
          webhookSecret: config.webhookSecret,
        })
        return new PaymentsClient(stripeProvider)
      },
      inject: options.inject || [],
    }

    return {
      module: StripeModule,
      providers: [paymentsClientProvider],
      exports: [paymentsClientProvider],
    }
  }
}
