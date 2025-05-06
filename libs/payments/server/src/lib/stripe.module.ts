import { DynamicModule, Module } from '@nestjs/common'
import Stripe from 'stripe'

export interface StripeModuleOptions {
  apiKey: string
  apiVersion?: '2023-10-16'
}

export const StripeClient = Symbol('STRIPE_CLIENT')

@Module({})
export class StripeModule {
  static forRoot(options: StripeModuleOptions): DynamicModule {
    const stripeProvider = {
      provide: StripeClient,
      useFactory: () => {
        if (!options.apiKey) {
          throw new Error('Stripe API key is required')
        }
        return new Stripe(options.apiKey, {
          apiVersion: options.apiVersion,
        })
      },
    }

    return {
      module: StripeModule,
      providers: [stripeProvider],
      exports: [stripeProvider],
    }
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => StripeModuleOptions | Promise<StripeModuleOptions>
    inject?: any[]
  }): DynamicModule {
    const stripeProvider = {
      provide: StripeClient,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args)
        if (!config.apiKey) {
          throw new Error('Stripe API key is required')
        }
        return new Stripe(config.apiKey, {
          apiVersion: config.apiVersion,
        })
      },
      inject: options.inject || [],
    }

    return {
      module: StripeModule,
      providers: [stripeProvider],
      exports: [stripeProvider],
    }
  }
}
