export * from './lib/stripe.module'
export * from './lib/payments.module'
export * from './lib/service/stripe.service'
export * from './lib/service/payments.service'
export * from './lib/rawBody.middleware'

export type CreateProductType = {
  stripeId: string
  name: string
  description: string
  features: Record<string, string>
  prices: {
    stripePrice: string
    unitAmount: number
    currency: string
    interval: 'month' | 'year'
  }[]
}

export type CreateProductWithPricesRequest = {
  name: string
  description: string
  features: Record<string, string>
  prices: {
    unitAmount: number
    currency: string
    interval: 'month' | 'year'
  }[]
}
