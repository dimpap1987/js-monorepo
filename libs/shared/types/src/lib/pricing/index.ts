export interface ProductMetadata {
  features?: Record<string, string>
  [key: string]: unknown
}

export interface PricingPlanResponse {
  id: number
  name: string
  description: string
  price: number
  metadata: ProductMetadata
  active?: boolean
  actionLabel: string
  prices: {
    id: number
    priceId: string
    unitAmount: number
    currency: string
    interval: string
    trialEligibility?: {
      eligible: boolean
      reason?: string
      trialDurationDays: number
      productName?: string
    }
  }[]
}
