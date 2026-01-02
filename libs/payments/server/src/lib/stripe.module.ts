import { DynamicModule, Module } from '@nestjs/common'
import { PaymentsClient, StripeProvider } from '@super-dp/payments-core'

export interface StripeModuleOptions {
  apiKey: string
  apiVersion?: string
  webhookSecret?: string
}

export const PaymentsClientToken = Symbol('PAYMENTS_CLIENT')
export const StripeProviderToken = Symbol('STRIPE_PROVIDER')

@Module({})
export class StripeModule {
  static forRoot(options: StripeModuleOptions): DynamicModule {
    const stripeProvider = new StripeProvider({
      apiKey: options.apiKey,
      apiVersion: options.apiVersion as any,
      webhookSecret: options.webhookSecret,
    })

    const paymentsClient = new PaymentsClient(stripeProvider)

    const stripeProviderProvider = {
      provide: StripeProviderToken,
      useValue: stripeProvider,
    }

    const paymentsClientProvider = {
      provide: PaymentsClientToken,
      useValue: paymentsClient,
    }

    return {
      module: StripeModule,
      providers: [paymentsClientProvider, stripeProviderProvider],
      exports: [paymentsClientProvider, stripeProviderProvider],
    }
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => StripeModuleOptions | Promise<StripeModuleOptions>
    inject?: any[]
  }): DynamicModule {
    // Create a shared factory that creates the StripeProvider once
    const stripeProviderFactory = {
      provide: StripeProviderToken,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args)
        if (!config.apiKey) {
          throw new Error('Stripe API key is required')
        }
        return new StripeProvider({
          apiKey: config.apiKey,
          apiVersion: config.apiVersion as any,
          webhookSecret: config.webhookSecret,
        })
      },
      inject: options.inject || [],
    }

    const paymentsClientProvider = {
      provide: PaymentsClientToken,
      useFactory: (stripeProvider: StripeProvider) => {
        return new PaymentsClient(stripeProvider)
      },
      inject: [StripeProviderToken],
    }

    return {
      module: StripeModule,
      providers: [stripeProviderFactory, paymentsClientProvider],
      exports: [paymentsClientProvider, stripeProviderFactory],
    }
  }
}
