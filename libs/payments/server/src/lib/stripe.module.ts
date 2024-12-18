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
      useValue: new Stripe(options.apiKey, {
        apiVersion: options.apiVersion,
      }),
    }

    return {
      module: StripeModule,
      providers: [stripeProvider],
      exports: [stripeProvider],
    }
  }
}
