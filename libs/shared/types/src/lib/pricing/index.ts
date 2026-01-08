export interface PricingPlanResponse {
  id: number
  name: string
  description: string
  price: number
  features: Record<string, string>
  active?: boolean
  actionLabel: string
  prices: {
    id: number
    priceId: string
    unitAmount: number
    currency: string
    interval: string
  }[]
}
