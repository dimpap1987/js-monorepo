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
  isSubscribed: boolean
  plan: string | null
  subscriptionId: number | null
  priceId: number | null
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

// Invoice types
export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible' | 'draft'

export interface Invoice {
  id: string
  number: string | null
  amount: number
  currency: string
  status: InvoiceStatus
  createdAt: string
  pdfUrl: string | null
  hostedInvoiceUrl: string | null
}

export interface InvoiceListResponse {
  invoices: Invoice[]
  hasMore: boolean
}
