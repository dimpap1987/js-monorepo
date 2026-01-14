/**
 * Structured response for subscription API endpoints
 * Accurately reflects the database entity structure:
 * - Subscription -> Price -> Product
 */
export interface SubscriptionPriceInfo {
  id: number
  unitAmount: number // Price in cents
  currency: string
  interval: string
  product: {
    id: number
    name: string // Product name (not Price name - Price doesn't have a name)
  }
}

export interface SubscriptionResponseDto {
  subscription: {
    id: number
    paymentCustomerId: number
    stripeSubscriptionId: string | null
    status: string
    currentPeriodStart: Date | null
    currentPeriodEnd: Date | null
    trialStart: Date | null
    trialEnd: Date | null
    cancelAt: Date | null
    canceledAt: Date | null
    cancelReason: string | null
    createdAt: Date
    updatedAt: Date
  }
  price: SubscriptionPriceInfo // Represents the Price entity (not "plan")
  priceId: number
}
