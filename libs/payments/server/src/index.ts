export * from './lib/constants'
export * from './lib/decorators/has-product.decorator'
export * from './lib/guards/subscription.guard'
export * from './lib/payments.module'
export * from './lib/rawBody.middleware'
export * from './lib/service/payments.service'
export * from './lib/service/stripe.service'
export * from './lib/service/admin-products.service'
export * from './lib/stripe.module'
export * from './lib/utils'

// Admin Product DTOs
export * from './lib/dto/admin-product.dto'

export type ProductMetadataType = {
  features?: Record<string, string>
  [key: string]: unknown
}

export type CreateProductType = {
  stripeId: string
  name: string
  description: string
  metadata: ProductMetadataType
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
  features: Record<string, string> // Stripe API expects features directly
  prices: {
    unitAmount: number
    currency: string
    interval: 'month' | 'year'
  }[]
}
