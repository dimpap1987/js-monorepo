import Stripe from 'stripe'

// Configuration: which plan to highlight as "Most Popular"
export const POPULAR_PLAN_NAME = 'basic'

export interface Subscription {
  id: number
  paymentCustomerId: number
  stripeSubscriptionId?: string
  priceId: number
  status: Stripe.Subscription.Status
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  trialStart?: Date
  trialEnd?: Date
  cancelAt?: Date
  canceledAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SessionSubscription {
  plans?: SubscriptionPlan[]
}

export interface SubscriptionPlan {
  subscriptionId: number
  price: PriceDetails
}

export interface PriceDetails {
  id: number
  product: ProductDetails
}

export interface ProductDetails {
  id: number
}

// FAQ types for pricing page
export interface FAQItem {
  question: string
  answer: string
}

// Pricing card data for the refactored pricing page
export interface PricingCardData {
  id: number
  name: string
  description: string
  price: number
  interval: string
  features: Record<string, string>
  isPopular?: boolean
  subscribed?: boolean
}

// Trust signal for pricing page
export interface TrustSignal {
  icon: React.ReactNode
  text: string
}
